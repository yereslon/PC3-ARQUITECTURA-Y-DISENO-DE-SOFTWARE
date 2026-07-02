# Matriz de auditoría y cumplimiento técnico

Esta matriz consolida capacidades, evidencias y criterios de cierre para una revisión técnica y académica del sistema. Su objetivo es ordenar qué está implementado, qué está documentado, qué requiere evidencia de demo y qué no debe presentarse como cerrado sin validación adicional.

## Ruta rápida de revisión

1. Revisar la matriz principal y filtrar por estado `pendiente`, `parcial` o `riesgo`.
2. Para cada capacidad, contrastar evidencia disponible contra evidencia requerida.
3. Ejecutar o adjuntar evidencia de demo solo cuando el entorno esté disponible.
4. Aplicar los criterios de cierre y no aprobación antes de declarar el sistema listo para entrega.

## Resumen de evidencia runtime capturada

La batería runtime fue ejecutada en entorno local controlado, con cleanup posterior de los datos creados para la validación. Esta evidencia permite sostener los casos indicados como ejecutados, pero no cierra brechas documentales u operativas pendientes como schemas formales de eventos, AsyncAPI, trazas distribuidas, alertas o SLOs.

| Área validada | Resultado observado | Alcance de la evidencia |
| --- | --- | --- |
| Inicialización de bases | `db_usuarios` con tablas `estudiantes` y `tutores` más 2 registros por tipo; `db_agenda` con tabla `bloqueos`, índice y seed; `db_tutorias` con tabla, índices y trigger. | DBs inicializadas tras confirmar estado vacío; estado final controlado: `bloqueos=1` solo seed y `tutorias=0`. |
| Salud mínima | `GET /usuarios/estudiantes/e12345` y `GET /usuarios/tutores/t54321` respondieron `200`; agenda devolvió `disponible:false` para slot seed ocupado y `disponible:true` para slot libre. | Verifica conectividad funcional mínima de usuarios y agenda. |
| Happy path | `POST /tutorias` respondió `201` con estado `CONFIRMADA`. | Se hizo cleanup exacto de tutoría y bloqueo creados. |
| Conflicto `409` | Repetir tutor/fecha respondió `409 Horario no disponible`; la base confirmó un solo bloqueo. | Se hizo cleanup exacto del dato creado. |
| Circuit Breaker/Toxiproxy | Toxic de latencia de 3000 ms; luego de la primera falla, el breaker abrió y respondió `503`; logs con estados `ABIERTO`, `HALF-OPEN` y `CERRADO`; `toxics=[]` al finalizar. | El primer timeout crudo puede responder `500 Timed out after 1500ms` antes del fast-fail `503`. |
| Saga compensation | Con `ENABLE_DEMO_FAULT_INJECTION=true` y `X-Demo-Fail-After-Bloqueo:true`, la respuesta fue `500` controlada, la tutoría quedó `FALLIDA` y agenda quedó con 0 bloqueos para el slot. | Modo temporal seguro restaurado: `ms-tutorias` normal sin env; con header pero sin env, el flujo volvió a `201 CONFIRMADA`. |
| RabbitMQ/DLQ | Estado final limpio: `notificaciones_email_queue=0` y `notificaciones_dlq=0`. | Evidencia de restauración final de colas; mantener pendiente la política formal de operación de DLQ. |

## Estados usados

| Estado | Significado |
| --- | --- |
| `implementado` | Existe soporte técnico identificable en código, configuración o contratos. |
| `documentado` | Existe explicación revisable, pero puede requerir ejecución para validarse. |
| `parcial` | Hay base técnica o documental, pero faltan pruebas, automatización, política o evidencia runtime. |
| `pendiente` | No se observa implementación o documentación suficiente para sostener la capacidad. |
| `riesgo` | Hay una condición que puede invalidar la demo, la operación o la afirmación de cumplimiento si no se controla. |

> Una capacidad puede estar implementada y aun así quedar `parcial` para cierre si no tiene evidencia ejecutada, criterio de aceptación o procedimiento de restauración.

## Matriz de capacidad vs evidencia

| Capacidad | Evidencia requerida | Evidencia disponible | Estado prudente | Responsable / componente |
| --- | --- | --- | --- | --- |
| Inicialización de bases | Confirmar estructura, índices/trigger esperados y seeds mínimos antes de ejecutar validaciones. | Runtime ejecutado tras confirmar DBs vacías: `db_usuarios` con 2 estudiantes y 2 tutores; `db_agenda` con `bloqueos`, índice y seed; `db_tutorias` con tabla, índices y trigger; estado final `bloqueos=1` solo seed y `tutorias=0`. | `implementado` | PostgreSQL / scripts de inicialización |
| HTTP y límites de servicio | Catálogo de servicios, endpoints principales, ownership por componente y respuestas esperadas. | [`docs/service-catalog.md`](./service-catalog.md), OpenAPI en `ms-*/docs/swagger.yaml`, rutas Express por servicio. | `implementado` / `documentado` | `ms-auth`, `ms-usuarios`, `ms-agenda`, `ms-tutorias`, `ms-notificaciones` |
| Integración síncrona | Evidencia de llamadas entre `ms-tutorias`, usuarios y agenda; manejo de errores de dependencias. | [`docs/service-catalog.md`](./service-catalog.md), [`docs/bpm-tutoria-process.md`](./bpm-tutoria-process.md), clientes en `ms-tutorias/src/infrastructure/clients/`; runtime confirmó salud mínima, happy path `201`, conflicto `409`, Circuit Breaker y restauración. | `implementado` / `parcial` | `ms-tutorias`, `ms-usuarios`, `ms-agenda` |
| Contratos OpenAPI | Archivos OpenAPI mínimos por servicio y coherencia con rutas públicas. | `ms-auth/docs/swagger.yaml`, `ms-usuarios/docs/swagger.yaml`, `ms-agenda/docs/swagger.yaml`, `ms-tutorias/docs/swagger.yaml`, `ms-notificaciones/docs/swagger.yaml`; trazabilidad en [`docs/service-catalog.md`](./service-catalog.md). | `documentado` / `parcial` | Cada microservicio |
| Eventos y DLQ | Contratos de colas/exchanges, payload esperado, conducta `ack`/`nack`, evidencia de mensaje inválido aislado. | [`docs/event-contracts.md`](./event-contracts.md), `notificaciones_email_queue`, `notificaciones_dlx`, `notificaciones_dlq`, productores/consumidor RabbitMQ; estado final runtime limpio `notificaciones_email_queue=0` y `notificaciones_dlq=0`. | `implementado` / `parcial` | `ms-tutorias`, `ms-notificaciones`, RabbitMQ |
| BPM / Saga | Flujo de proceso, pasos de orquestación, estados, compensación y límites del proceso. | [`docs/bpm-tutoria-process.md`](./bpm-tutoria-process.md), lógica de Saga en `ms-tutorias/src/domain/services/tutoria.service.js`; runtime de compensación con fault injection temporal dejó tutoría `FALLIDA` y sin bloqueo huérfano. | `implementado` / `parcial` | `ms-tutorias`, `ms-agenda` |
| Seguridad de APIs | JWT, autorización mínima, integridad de identidad, secretos de entorno y casos de rechazo `401`/`403`. | [`docs/api-security-controls.md`](./api-security-controls.md), `ms-auth`, middleware JWT de `ms-tutorias`, contratos OpenAPI. | `implementado` / `parcial` | `ms-auth`, `ms-tutorias`, gateway si se aplica |
| Resiliencia `409` | Evidencia de conflicto controlado sin doble bloqueo y respuesta `409 Conflict`. | [`docs/pc03.md`](./pc03.md), restricción única de agenda documentada; runtime confirmó `409 Horario no disponible` y un solo bloqueo persistido. | `implementado` | `ms-agenda`, `ms-tutorias` |
| Circuit Breaker | Timeout/falla rápida ante degradación de usuarios, restauración de Toxiproxy y evidencia de `503`. | [`docs/pc03.md`](./pc03.md), [`docs/observability-runbook.md`](./observability-runbook.md), cliente de usuarios con Circuit Breaker; runtime confirmó apertura con `503`, transiciones `ABIERTO`/`HALF-OPEN`/`CERRADO` y Toxiproxy restaurado sin toxics. | `implementado` / `parcial` | `ms-tutorias`, `ms-usuarios`, Toxiproxy |
| Compensación de Saga | Falla controlada posterior al bloqueo, eliminación del bloqueo, tutoría fallida y cleanup. | [`docs/pc03.md`](./pc03.md), [`docs/bpm-tutoria-process.md`](./bpm-tutoria-process.md), fault injection gated por variable de entorno y header; runtime confirmó `500` controlado, tutoría `FALLIDA`, 0 bloqueos para el slot y restauración del modo normal. | `implementado` | `ms-tutorias`, `ms-agenda` |
| Observabilidad | Correlation ID, logs, eventos de tracking, métricas si el entorno está levantado y brechas declaradas. | [`docs/observability-runbook.md`](./observability-runbook.md), dashboard de tracking, `prometheus.yml`, `docker-compose.yml`; runtime capturó logs de Circuit Breaker y estados de persistencia/colas para los casos validados. | `documentado` / `parcial` | Todos los servicios, `tracking-dashboard`, Prometheus/Grafana |
| Despliegue local | Guía de variables, Docker Compose, puertos, inicialización de bases y recursos operativos. | [`docs/setup-and-usage.md`](./setup-and-usage.md), `docker-compose.yml`, manifiestos Kubernetes existentes; inicialización local de DBs validada en runtime para usuarios, agenda y tutorías. | `documentado` / `parcial` | Infraestructura local y manifiestos |
| Operación y restauración | Pasos de preflight, cleanup, restauración de fallas inducidas y validación posterior. | Evidencia académica consolidada en [`docs/pc03.md`](./pc03.md); detalles operativos en [`docs/setup-and-usage.md`](./setup-and-usage.md), [`docs/observability-runbook.md`](./observability-runbook.md), [`docs/event-contracts.md`](./event-contracts.md) y esta matriz; runtime confirmó cleanup exacto en happy path, `409`, Saga y restauración de Toxiproxy/RabbitMQ. | `documentado` / `parcial` | Responsable de demo / operación local |
| Gobierno documental | Catálogo, contratos, matriz de evidencias, criterios de cierre y brechas explícitas. | [`docs/service-catalog.md`](./service-catalog.md), [`docs/event-contracts.md`](./event-contracts.md), [`docs/bpm-tutoria-process.md`](./bpm-tutoria-process.md), [`docs/api-security-controls.md`](./api-security-controls.md), este documento. | `documentado` | Responsable documental / arquitectura |

## Evidencia por tipo

| Tipo de evidencia | Uso esperado | Disponible hoy | Brecha principal |
| --- | --- | --- | --- |
| Contrato | Revisar rutas, payloads HTTP y expectativas mínimas por servicio. | OpenAPI en `ms-*/docs/swagger.yaml`; contratos de eventos en [`docs/event-contracts.md`](./event-contracts.md). | Eventos sin AsyncAPI/JSON Schema formal ni versionado explícito. |
| Demo | Probar flujo feliz, conflicto `409`, DLQ, Circuit Breaker y compensación. | Evidencia consolidada bajo [`docs/pc03.md`](./pc03.md); batería runtime ejecutada con pass y cleanup para DB init, salud mínima, happy path, `409`, Circuit Breaker, Saga compensation y estado final de RabbitMQ/DLQ. Los detalles operativos se distribuyen en setup, contratos, observabilidad y esta matriz. | Mantener capturas/logs asociados fuera de esta matriz si se requieren como anexo formal; la documentación no reemplaza evidencia cruda. |
| Log | Correlacionar ejecución por `X-Correlation-ID` entre servicios. | Runbook en [`docs/observability-runbook.md`](./observability-runbook.md). | No hay centralización ni retención formal de logs. |
| Test | Validar comportamiento crítico sin depender solo de demo manual. | Existe prueba unitaria de fault injection en el código de `ms-tutorias`; la evidencia académica asociada debe referirse desde [`docs/pc03.md`](./pc03.md). | Falta ampliar pruebas automatizadas para contratos, DLQ, concurrencia `409` y seguridad. |
| Documento | Permitir revisión sin reconstruir el sistema desde el código. | Carpeta `docs/` con catálogo, setup, eventos, BPM, seguridad, observabilidad y validación operativa. | Falta completar runbooks futuros de despliegue/operación si se exige operación fuera del entorno local. |

## Criterio de cierre

Una capacidad puede marcarse como cerrada para revisión cuando cumple todos estos puntos:

- Tiene al menos una evidencia documental enlazada y una evidencia técnica verificable.
- Si requiere runtime, existe captura o registro de ejecución con `X-Correlation-ID` o identificador equivalente.
- Los errores esperados están documentados con código, condición y resultado aceptable.
- La restauración posterior a fallas inducidas está definida y fue ejecutada cuando aplica.
- Las brechas conocidas quedan declaradas como `parcial`, `pendiente` o `riesgo`; no se presentan como funcionalidades completas.

## Criterios de no aprobación

La revisión debe considerarse no aprobada si ocurre cualquiera de estas condiciones:

- Se declara una capacidad como cerrada sin evidencia técnica o documental suficiente.
- Una falla inducida queda activa después de la validación, especialmente Toxiproxy o fault injection de Saga.
- Se presenta observabilidad como monitoreo productivo completo sin trazas distribuidas, alertas, SLOs o retención formal.
- Se afirma cumplimiento de seguridad productiva usando secretos, credenciales o configuraciones de demo.
- Faltan contratos mínimos para explicar rutas o payloads críticos usados en la demo.
- La compensación de Saga se muestra sin evidencia de bloqueo creado, falla inducida, compensación ejecutada y ausencia de bloqueo huérfano.
- La DLQ se menciona sin evidencia de rechazo sin requeue o sin mensaje aislado en la cola dead-letter.
- El conflicto `409` no demuestra que se evitó una doble reserva en persistencia.

## Trazabilidad documental

| Documento | Uso en auditoría |
| --- | --- |
| [`docs/service-catalog.md`](./service-catalog.md) | Inventario de servicios, ownership técnico, dependencias y cobertura de contratos. |
| [`docs/setup-and-usage.md`](./setup-and-usage.md) | Preparación local, variables, bases de datos, recursos y enlaces a validaciones. |
| [`docs/event-contracts.md`](./event-contracts.md) | RabbitMQ, colas, DLQ, tracking y payloads observados. |
| [`docs/bpm-tutoria-process.md`](./bpm-tutoria-process.md) | Flujo BPM, Saga orquestada, estados y compensación. |
| [`docs/api-security-controls.md`](./api-security-controls.md) | JWT, roles, integridad de identidad, headers y riesgos de seguridad. |
| [`docs/observability-runbook.md`](./observability-runbook.md) | Logs, correlation ID, dashboard, métricas y troubleshooting. |
| [`docs/pc03.md`](./pc03.md) | Fuente canónica del enunciado PC03/APF3 y criterios académicos de evaluación. |

## Riesgos abiertos y próximos controles

- Formalizar contratos de eventos con schema versionado si se exige validación automática.
- Agregar pruebas automatizadas para seguridad, DLQ, concurrencia `409` y contratos críticos.
- Definir política de secretos por entorno antes de usar la configuración fuera de demo/local.
- Documentar operación de DLQ: inspección, replay, descarte, ownership y retención.
- Completar runbook de despliegue y operación si el cierre requiere ejecutar fuera del entorno local.
