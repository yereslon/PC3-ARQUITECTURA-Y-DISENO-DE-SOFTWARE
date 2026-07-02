// ms-agenda/src/infrastructure/repositories/agenda.repository.js
const db = require('../../config/db');

// Función auxiliar para mapear de DB (snake_case/lowercase) a Dominio (camelCase)
const mapBloqueo = (row) => {
    return {
        idBloqueo: row.idbloqueo,
        idTutor: row.idtutor,
        fechaInicio: row.fechainicio, // Aquí está la clave: mapeamos fechainicio -> fechaInicio
        duracionMinutos: row.duracionminutos,
        idEstudiante: row.idestudiante
    };
};

const findBloqueosByTutor = async (idTutor) => {
    const queryText = 'SELECT idBloqueo, idTutor, fechaInicio, duracionMinutos, idEstudiante FROM bloqueos WHERE idTutor = $1 ORDER BY fechaInicio ASC';
    try {
        const res = await db.query(queryText, [idTutor]);
        // Mapeamos cada fila antes de devolverla
        return res.rows.map(mapBloqueo);
    } catch (err) {
        console.error('Error ejecutando query findBloqueosByTutor:', err.stack);
        throw err;
    }
};

const saveBloqueo = async (datosBloqueo) => {
    const { idTutor, fechaInicio, duracionMinutos, idEstudiante } = datosBloqueo;
    const queryText = 'INSERT INTO bloqueos(idTutor, fechaInicio, duracionMinutos, idEstudiante) VALUES($1, $2, $3, $4) RETURNING *';
    try {
        const res = await db.query(queryText, [idTutor, fechaInicio, duracionMinutos, idEstudiante]);
        // Mapeamos la fila creada
        return mapBloqueo(res.rows[0]);
    } catch (err) {
        console.error('Error ejecutando query saveBloqueo:', err.stack);
        throw err;
    }
};

const deleteBloqueoById = async (idBloqueo) => {
    const queryText = 'DELETE FROM bloqueos WHERE idBloqueo = $1 RETURNING *';
    try {
        const res = await db.query(queryText, [idBloqueo]);
        return res.rowCount > 0; // Devuelve true si borró algo
    } catch (err) {
        console.error('Error ejecutando query deleteBloqueoById:', err.stack);
        throw err;
    }
};

module.exports = {
    findBloqueosByTutor,
    saveBloqueo,
    deleteBloqueoById
};
