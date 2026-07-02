// ms-tutorias/src/domain/services/tutoria.service.js
const tutoriaRepository = require('../../infrastructure/repositories/tutoria.repository');
const usuariosClient = require('../../infrastructure/clients/usuarios.client');
const agendaClient = require('../../infrastructure/clients/agenda.client');
const { publishToQueue, publishTrackingEvent } = require('../../infrastructure/messaging/message.producer'); // <-- Actualizar importación

// Función helper para publicar tracking
const track = (cid, message, status = 'INFO') => {
    publishTrackingEvent({
        service: 'MS_Tutorias',
        message,
        cid,
        timestamp: new Date(),
        status
    });
};

const isDemoFaultInjectionEnabled = () => process.env.ENABLE_DEMO_FAULT_INJECTION === 'true';

const shouldFailAfterBloqueo = (options = {}) => {
    return isDemoFaultInjectionEnabled() && options.demoFailAfterBloqueo === true;
};

const solicitarTutoria = async (datosSolicitud, correlationId, options = {}) => {
    const { idEstudiante, idTutor, fechaSolicitada, duracionMinutos, materia } = datosSolicitud;
    let nuevaTutoria;
    let bloqueoRealizado = null;

    try {
        // --- 1. Validar usuarios ---
        track(correlationId, 'Validando usuarios...');
        const [estudiante, tutor] = await Promise.all([
            usuariosClient.getUsuario('estudiantes', idEstudiante, correlationId),
            usuariosClient.getUsuario('tutores', idTutor, correlationId)
        ]);
        if (!estudiante) throw { statusCode: 404, message: 'Estudiante no encontrado' };
        if (!tutor) throw { statusCode: 404, message: 'Tutor no encontrado' };
        track(correlationId, 'Usuarios validados exitosamente.');

        // --- 2. Verificar agenda ---
        track(correlationId, 'Verificando disponibilidad de agenda...');
        const disponible = await agendaClient.verificarDisponibilidad(idTutor, fechaSolicitada, correlationId);
        if (!disponible) throw { statusCode: 409, message: 'Horario no disponible' };
        track(correlationId, 'Agenda verificada (disponible).');

        // --- 3. Crear PENDIENTE ---
        track(correlationId, 'Creando tutoría en estado PENDIENTE...');
        const tutoriaPendienteData = { idEstudiante, idTutor, fecha: new Date(fechaSolicitada), materia, estado: 'PENDIENTE' };
        nuevaTutoria = await tutoriaRepository.save(tutoriaPendienteData);
        track(correlationId, `Tutoría PENDIENTE guardada (ID: ${nuevaTutoria.idtutoria}).`);

        // --- 4. Comandos de la Saga ---
        track(correlationId, 'Bloqueando horario en agenda...');
        const payloadAgenda = { fechaInicio: fechaSolicitada, duracionMinutos, idEstudiante };
        bloqueoRealizado = await agendaClient.bloquearAgenda(idTutor, payloadAgenda, correlationId);
        const idBloqueo = bloqueoRealizado.idBloqueo || bloqueoRealizado.idbloqueo;
        track(correlationId, `Bloqueo de agenda exitoso. ID: ${idBloqueo}`);

        if (shouldFailAfterBloqueo(options)) {
            track(correlationId, 'Fault injection demo activado después del bloqueo de agenda.', 'ERROR');
            throw {
                statusCode: 500,
                message: 'Falla demo controlada después del bloqueo de agenda',
                code: 'DEMO_FAULT_AFTER_BLOQUEO'
            };
        }

        track(correlationId, 'Publicando evento de notificación en RabbitMQ...');
        const payloadNotificacion = {
            destinatario: estudiante.email,
            asunto: `Tutoría de ${materia} confirmada`,
            cuerpo: `Hola ${estudiante.nombrecompleto || estudiante.nombreCompleto}, tu tutoría con ${tutor.nombrecompleto || tutor.nombreCompleto} ha sido confirmada...`,
            correlationId: correlationId
        };
        publishToQueue('notificaciones_email_queue', payloadNotificacion); // Sigue publicando en la COLA
        track(correlationId, 'Evento de notificación publicado.');

        // --- 5. Confirmar ---
        track(correlationId, 'Actualizando estado a CONFIRMADA...');
        const tutoriaConfirmadaPayload = { idTutoria: nuevaTutoria.idtutoria, estado: 'CONFIRMADA', error: null };
        const tutoriaConfirmada = await tutoriaRepository.save(tutoriaConfirmadaPayload);
        track(correlationId, 'Actualización a CONFIRMADA exitosa.');
        return tutoriaConfirmada;

    } catch (error) {
        const status = error.response?.status || error.statusCode || 500;

        // Intentamos obtener el mensaje más específico posible
        const msg = error.response?.data?.error?.message || error.message;

        console.error(`[MS_Tutorias Service] - CID: ${correlationId} - Finalizando con error. Status: ${status}. Mensaje: ${msg}`);

        track(correlationId, `Proceso fallido. Causa: ${msg}`, 'ERROR');
        // --- Compensación ---
        console.error(`[MS_Tutorias Service] - CID: ${correlationId} - ERROR CAPTURADO: ${error.message}`);
        track(correlationId, `ERROR: ${error.message}`, 'ERROR'); // <-- Publicar evento de error

        const idBloqueo = bloqueoRealizado?.idBloqueo || bloqueoRealizado?.idbloqueo;
        if (idBloqueo) {
            track(correlationId, 'COMPENSACIÓN: Desbloqueando agenda...', 'ERROR');
            try {
                await agendaClient.cancelarBloqueo(idBloqueo, correlationId);
                track(correlationId, 'Compensación (Agenda) exitosa.', 'ERROR');
            } catch (compError) {
                track(correlationId, `FALLÓ compensación de agenda: ${compError.message}`, 'ERROR');
                // En producción: guardar en una cola de "reintentos pendientes" o alertar a un humano
            }
        }

        if (nuevaTutoria && nuevaTutoria.idtutoria) {
            track(correlationId, 'Iniciando compensación: Marcando tutoría como FALLIDA.', 'ERROR');
            const compensacionPayload = { idTutoria: nuevaTutoria.idtutoria, estado: 'FALLIDA', error: error.message };
            try {
                await tutoriaRepository.save(compensacionPayload);
                track(correlationId, 'Compensación (FALLIDA) guardada exitosamente.', 'ERROR');
            } catch (compensacionError) {
                track(correlationId, `¡¡ERROR CRÍTICO EN COMPENSACIÓN!!: ${compensacionError.message}`, 'ERROR');
            }
        }
        // Relanzar el error manteniendo el contrato público existente.
        throw { statusCode: status, message: `No se pudo completar la solicitud: ${msg}` };
    }
};

module.exports = { solicitarTutoria };
