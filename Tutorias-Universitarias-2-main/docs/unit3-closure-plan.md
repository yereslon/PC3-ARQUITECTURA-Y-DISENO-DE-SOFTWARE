# Plan de cierre — Bloque de implementación, operación y gobierno

El bloque de implementación, operación y gobierno ya tiene una base técnica fuerte en servicios HTTP, integración entre microservicios, seguridad básica, resiliencia y operación local. La prioridad ahora es convertir esa implementación en evidencia académica revisable, repetible y defendible.

## Ruta recomendada

1. Cerrar contratos y gobierno base con OpenAPI por servicio.
2. Consolidar la evidencia académica en PC03 y mantener los detalles operativos en documentos especializados.
3. Capturar evidencia de Saga compensation usando el fault injection determinístico incorporado.
4. Documentar eventos, BPM, seguridad, auditoría y operación.
5. Preparar el guion final de demo y presentación integral.

## Matriz de avance

| Bloque | Tema | Estado | Evidencia actual | Brecha | Artefacto recomendado |
| --- | --- | --- | --- | --- | --- |
| 21 | Implementación básica de servicios HTTP | Cubierto | Servicios y rutas Express existentes | Evidencia compacta por endpoint | Checklist de servicio funcionando |
| 22 | Consumo entre servicios y manejo de errores | Cubierto | `ms-tutorias` integra usuarios, agenda y notificaciones | Matriz de errores integrada | `docs/integrated-flow-errors.md` |
| 23 | Integración B2B moderna | Pendiente | No hay diseño B2B explícito | Contratos, SLAs y validaciones B2B | `docs/b2b-integration-design.md` |
| 24 | Webhooks, eventos y automatización simple | Parcial | RabbitMQ y eventos de tracking | Flujo de eventos documentado | `docs/events-and-webhooks.md` |
| 25 | BPM y automatización de procesos | Parcial | Saga de solicitud de tutoría | BPMN o simulación del proceso | `docs/bpm-tutoria-process.md` |
| 26 | Seguridad aplicada a APIs | Parcial | JWT en `ms-tutorias` y configuración Kong | Evidencia de controles mínimos | `docs/api-security-controls.md` |
| 27 | Resiliencia I | Cubierto | Timeout, Circuit Breaker, Toxiproxy y conflicto 409 | Scripts/evidencia repetible | Consolidar evidencia en `docs/pc03.md` y detalles en `docs/observability-runbook.md` |
| 28 | Resiliencia II | Cubierto con validación pendiente | Saga compensation implementada con fault injection determinístico controlado | Falta capturar evidencia final de demo | Conservar evidencia bajo el criterio canónico de `docs/pc03.md` |
| 29 | Observabilidad I | Parcial | Tracking dashboard, correlation ID, Prometheus/Grafana | Runbook de qué observar y por qué | `docs/observability-runbook.md` |
| 30 | Validación operativa integral | Parcial | Evidencia runtime y documentación especializada | Checklist integral de demo | `docs/pc03.md`, `docs/setup-and-usage.md`, `docs/observability-runbook.md` |
| 31 | Gobierno de servicios y documentación técnica | Parcial | `docs/service-catalog.md` | OpenAPI vacío o faltante | `ms-*/docs/swagger.yaml` |
| 32 | Auditoría técnica y cumplimiento básico | Parcial | Matriz de auditoría documentada en `docs/audit-compliance-matrix.md` | Completar evidencia y criterios de retención | `docs/audit-compliance-matrix.md` |
| 33 | Despliegue básico y operación del servicio | Parcial | Docker Compose y manifiestos K8s | Runbook de operación | `docs/deployment-operations-runbook.md` |
| 34 | Integración final y preparación del proyecto | Parcial | README y flujo base | Guion candidato final | `docs/final-candidate-demo-script.md` |
| 35 | Presentación integral final | Parcial | Material técnico base | Narrativa integral | `docs/final-presentation-outline.md` |

## Próximos 3 parches

### 1. OpenAPI mínimo por servicio

Crear o completar los contratos reales desde las rutas existentes.

- `ms-auth/docs/swagger.yaml`
- `ms-usuarios/docs/swagger.yaml`
- `ms-agenda/docs/swagger.yaml`
- `ms-tutorias/docs/swagger.yaml`
- `ms-notificaciones/docs/swagger.yaml`
- `docs/service-catalog.md`

Este parche desbloquea los bloques 21, 22, 26 y 31.

### 2. Evidencia académica y validaciones operativas repetibles

Consolidar la evidencia académica en la PC03 y mantener los pasos operativos en documentos enfocados.

- `docs/pc03.md`
- `docs/setup-and-usage.md`
- `docs/observability-runbook.md`
- `docs/event-contracts.md`
- `docs/audit-compliance-matrix.md`

Usar `docs/pc03.md` como fuente canónica para el alcance académico. Los documentos especializados deben sostener setup, contratos, observabilidad, auditoría y limpieza sin duplicar el enunciado PC03/APF3.

Este parche fortalece los bloques 27, 29 y 30.

### 3. Fault injection de Saga compensation

Modo controlado incorporado para provocar una falla posterior al bloqueo de agenda y probar la compensación sin depender de fallas manuales.

- `ms-tutorias/src/domain/services/tutoria.service.js`
- documentación asociada en `docs/bpm-tutoria-process.md` y evidencia académica consolidada en `docs/pc03.md`

Este parche elimina el riesgo principal del bloque 28 a nivel de implementación. El cierre académico requiere adjuntar evidencia conforme a `docs/pc03.md` y a los documentos operativos especializados.

## Criterio de avance

No se debe marcar un bloque como cerrado solo porque el código existe. Cada bloque queda cerrado cuando tenga:

- evidencia técnica verificable;
- documento o contrato asociado;
- pasos de reproducción o demo;
- brechas explícitas si algo queda fuera de alcance.
