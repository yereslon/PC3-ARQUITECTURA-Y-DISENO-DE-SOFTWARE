# Tutorías Universitarias 2

Caso académico de microservicios para modelar, ejecutar y analizar un sistema de solicitud de tutorías universitarias. El proyecto permite estudiar diseño de servicios, arquitectura distribuida, integración, resiliencia, observabilidad y operación local con evidencia técnica reproducible.

## Qué problema modela

El caso representa el flujo donde un estudiante solicita una tutoría con un tutor disponible. La solución debe autenticar al usuario, validar participantes, verificar disponibilidad, bloquear agenda, registrar la tutoría, emitir eventos de notificación y dejar trazabilidad operativa del proceso.

El problema es útil porque concentra retos comunes de arquitectura orientada a servicios:

- separación de responsabilidades por servicio;
- comunicación HTTP síncrona entre dominios;
- comunicación asíncrona con RabbitMQ;
- consistencia eventual y compensación de Saga;
- manejo de fallas, timeouts, Circuit Breaker y DLQ;
- trazabilidad mediante `X-Correlation-ID`, dashboard y métricas.

## Para qué sirve como caso de estudio

Este repositorio sirve para formación y práctica en diseño, arquitectura de software y arquitectura orientada a servicios. Permite explicar y demostrar cómo una solución distribuida evoluciona desde servicios HTTP básicos hacia un ecosistema con contratos, eventos, resiliencia, observabilidad, gobierno técnico y preparación de despliegue.

## Capacidades desarrolladas

| Capacidad | Estado | Evidencia principal |
| --- | --- | --- |
| Servicios HTTP separados por responsabilidad | Implementado | `ms-auth`, `ms-usuarios`, `ms-agenda`, `ms-tutorias`, `ms-notificaciones` |
| Flujo integrado de solicitud de tutoría | Implementado | `client-mobile-sim`, `ms-tutorias`, `ms-usuarios`, `ms-agenda` |
| Autenticación con JWT | Implementado | `ms-auth`, rutas protegidas de `ms-tutorias` |
| Consumo entre servicios y manejo de errores | Implementado/parcial | Clientes HTTP en `ms-tutorias/src/infrastructure/clients/` |
| OpenAPI mínimo por servicio | Documentado | `ms-*/docs/swagger.yaml` |
| Catálogo de servicios | Documentado | [`docs/service-catalog.md`](./docs/service-catalog.md) |
| RabbitMQ para notificaciones y tracking | Implementado/parcial | `ms-notificaciones`, productores de eventos, `tracking-dashboard` |
| Dead Letter Queue de notificaciones | Implementado con validación documentada | [`docs/event-contracts.md`](./docs/event-contracts.md), [`docs/pc03.md`](./docs/pc03.md) |
| Consistencia de agenda con conflicto `409` | Implementado | `ms-agenda`, [`docs/pc03.md`](./docs/pc03.md) |
| Circuit Breaker, timeout y Toxiproxy | Implementado con validación documentada | `toxiproxy.json`, `docker-compose.yml`, [`docs/observability-runbook.md`](./docs/observability-runbook.md) |
| Saga compensation con fault injection seguro | Implementado con demo documentada | `ms-tutorias`, [`docs/bpm-tutoria-process.md`](./docs/bpm-tutoria-process.md), [`docs/pc03.md`](./docs/pc03.md) |
| Tracking dashboard y correlation ID | Implementado/parcial | `tracking-dashboard`, eventos de tracking |
| Prometheus/Grafana | Parcial | `prometheus.yml`, servicios en Docker Compose |
| Docker Compose para entorno local | Implementado | `docker-compose.yml` |

## Capacidades en desarrollo o por fortalecer

| Capacidad | Estado actual | Riesgo o siguiente acción |
| --- | --- | --- |
| Contratos de eventos RabbitMQ | Documentado inicial | Revisar [`docs/event-contracts.md`](./docs/event-contracts.md) y reforzar validación formal, versionado y compatibilidad si se requiere. |
| Gobierno de APIs | Parcial | Definir política mínima de versionado, ownership y compatibilidad. |
| BPM del proceso de tutoría | Documentado inicial | Revisar [`docs/bpm-tutoria-process.md`](./docs/bpm-tutoria-process.md) y completar evidencia si se requiere. |
| Seguridad aplicada a APIs | Documentado inicial | Revisar [`docs/api-security-controls.md`](./docs/api-security-controls.md) y completar evidencias de controles. |
| Auditoría técnica | Documentado inicial | Revisar [`docs/audit-compliance-matrix.md`](./docs/audit-compliance-matrix.md) y completar evidencia/retención. |
| Runbook de observabilidad | Documentado inicial | Revisar [`docs/observability-runbook.md`](./docs/observability-runbook.md) y completar evidencias operativas. |
| Despliegue fuera de Docker Compose | Parcial | Consolidar manifiestos, configuración y estrategia de operación. |
| Demo final repetible | Parcial | Ejecutar checklist operativo y conservar evidencias verificables. |

## Estado actual por bloques de interés

| Bloque | Estado | Qué demuestra | Documentación relacionada |
| --- | --- | --- | --- |
| HTTP | Implementado | Servicios Express con rutas funcionales para autenticación, usuarios, agenda y tutorías. | [`docs/service-catalog.md`](./docs/service-catalog.md) |
| Integración | Implementado/parcial | `ms-tutorias` orquesta llamadas a usuarios y agenda; hay manejo de errores controlados. | [`docs/service-catalog.md`](./docs/service-catalog.md) |
| Contratos | Documentado mínimo | Cada servicio cuenta con OpenAPI base para rutas principales. | `ms-*/docs/swagger.yaml` |
| Eventos | Documentado inicial | RabbitMQ soporta notificaciones y tracking; los contratos observados están documentados con alcance prudente. | [`docs/event-contracts.md`](./docs/event-contracts.md), [`docs/service-catalog.md`](./docs/service-catalog.md) |
| BPM/proceso | Documentado inicial | La Saga modela el proceso principal y cuenta con flujo documentado. | [`docs/bpm-tutoria-process.md`](./docs/bpm-tutoria-process.md) |
| Seguridad | Documentado inicial | JWT disponible para autenticación y autorización básica; controles y brechas documentados. | [`docs/api-security-controls.md`](./docs/api-security-controls.md), `ms-auth/docs/swagger.yaml`, `ms-tutorias/docs/swagger.yaml` |
| Resiliencia | Implementado con validación documentada | Conflicto `409`, timeout, Circuit Breaker, DLQ y compensación de Saga. | [`docs/pc03.md`](./docs/pc03.md), [`docs/event-contracts.md`](./docs/event-contracts.md), [`docs/observability-runbook.md`](./docs/observability-runbook.md) |
| Observabilidad | Documentado inicial | Correlation ID, tracking dashboard y métricas Prometheus/Grafana si están activos. | [`docs/observability-runbook.md`](./docs/observability-runbook.md) |
| Gobierno | Parcial | Catálogo de servicios y brechas explícitas. | [`docs/service-catalog.md`](./docs/service-catalog.md) |
| Auditoría | Documentado inicial | Hay trazabilidad operativa y matriz de auditoría/cumplimiento inicial. | [`docs/audit-compliance-matrix.md`](./docs/audit-compliance-matrix.md), [Plan de cierre de capacidades](./docs/unit3-closure-plan.md) |
| Despliegue | Parcial | Docker Compose operativo; despliegue avanzado aún requiere consolidación. | [`docs/setup-and-usage.md`](./docs/setup-and-usage.md) |
| Demo final | Parcial | La evidencia académica se consolida en la PC03; los detalles operativos viven en documentos especializados. | [`docs/pc03.md`](./docs/pc03.md), [`docs/setup-and-usage.md`](./docs/setup-and-usage.md), [`docs/observability-runbook.md`](./docs/observability-runbook.md) |

## Arquitectura local

El entorno local se levanta con Docker Compose e integra servicios de aplicación e infraestructura.

### Servicios de aplicación

| Servicio | Responsabilidad | Puerto local |
| --- | --- | --- |
| `client-mobile-sim` | Cliente web para simular solicitudes. | `8080` |
| `tracking-dashboard` | Dashboard de trazabilidad en vivo. | `9000` |
| `ms-auth` | Emisión de tokens JWT. | `4000` |
| `ms-usuarios` | Consulta de estudiantes y tutores. | `3001` |
| `ms-agenda` | Disponibilidad, bloqueo y liberación de agenda. | `3002` |
| `ms-tutorias` | Orquestación de la solicitud de tutoría. | `3000` |
| `ms-notificaciones` | Worker de notificaciones por RabbitMQ. | `3003` |

### Infraestructura local

| Componente | Uso | Puerto local |
| --- | --- | --- |
| `db-usuarios` | PostgreSQL de usuarios. | `5432` |
| `db-agenda` | PostgreSQL de agenda. | `5433` |
| `db-tutorias` | PostgreSQL de tutorías. | `5434` |
| `rabbitmq` | Broker AMQP y panel de gestión. | `5672`, `15672` |
| `toxiproxy` | Inyección controlada de fallas hacia `ms-usuarios`. | `8474`, `8001` |
| `prometheus` | Recolección de métricas. | `9091` |
| `grafana` | Visualización de métricas. | `3005` |

## Puesta en marcha rápida

> Para comandos completos, variables de entorno, scripts SQL y flujo de prueba paso a paso, usar [`docs/setup-and-usage.md`](./docs/setup-and-usage.md).

### Prerrequisitos

- Git.
- Node.js 18+ para trabajo local fuera de contenedores.
- Docker Desktop en ejecución.
- Cliente SQL como DBeaver, pgAdmin o `psql`.

### Levantar el entorno

```bash
docker-compose up --build
```

Después de iniciar los contenedores, inicializar las tres bases de datos con los scripts de [`docs/setup-and-usage.md`](./docs/setup-and-usage.md#inicializar-bases-de-datos).

### Verificar accesos principales

| Recurso | URL | Uso |
| --- | --- | --- |
| Cliente web | <http://localhost:8080> | Ejecutar una solicitud de tutoría. |
| Dashboard de tracking | <http://localhost:9000> | Observar eventos de la Saga. |
| RabbitMQ Management | <http://localhost:15672> | Revisar colas, exchanges y DLQ. Usuario/clave local por defecto: `rabbit` / `rabbit`, sobreescribible por entorno. |
| Prometheus | <http://localhost:9091> | Consultar métricas si el entorno local está activo. |
| Grafana | <http://localhost:3005> | Visualizar métricas si se configura el dashboard. Clave local por defecto: `local-dev-admin`, sobreescribible por entorno. |

### Flujo principal de prueba

1. Abrir el cliente web y el dashboard de tracking.
2. Solicitar un token desde el cliente o desde `POST http://localhost:4000/auth/token`.
3. Enviar una solicitud de tutoría válida.
4. Verificar respuesta `CONFIRMADA` y eventos correlacionados en el dashboard.
5. Para pruebas de resiliencia, seguir la guía especializada antes de activar fallas inducidas.

## Documentación especializada

| Documento | Para qué usarlo |
| --- | --- |
| [`docs/setup-and-usage.md`](./docs/setup-and-usage.md) | Configuración local, SQL inicial y uso básico. |
| [`docs/service-catalog.md`](./docs/service-catalog.md) | Responsabilidades, dependencias, ownership y contratos por servicio. |
| [`docs/event-contracts.md`](./docs/event-contracts.md) | Contratos RabbitMQ observados, colas, exchanges, DLQ y payloads actuales. |
| [`docs/bpm-tutoria-process.md`](./docs/bpm-tutoria-process.md) | Flujo del proceso de solicitud de tutoría y Saga orquestada. |
| [`docs/api-security-controls.md`](./docs/api-security-controls.md) | Controles de seguridad API, evidencias disponibles y brechas. |
| [`docs/observability-runbook.md`](./docs/observability-runbook.md) | Guía operativa para diagnosticar solicitudes, eventos, métricas y fallas. |
| [`docs/audit-compliance-matrix.md`](./docs/audit-compliance-matrix.md) | Matriz inicial de auditoría, cumplimiento, evidencia y criterios de cierre. |
| [`docs/pc03.md`](./docs/pc03.md) | Fuente canónica del enunciado PC03/APF3 y criterios académicos de evaluación. |
| [Plan de cierre de capacidades](./docs/unit3-closure-plan.md) | Plan histórico de cierre técnico y brechas pendientes. |
| `ms-*/docs/swagger.yaml` | Contratos OpenAPI mínimos por servicio. |

## Roadmap técnico

- Reforzar validación formal, versionado y compatibilidad de eventos RabbitMQ.
- Completar gobierno de APIs y versionado.
- Completar evidencias del proceso de solicitud de tutoría.
- Completar evidencia, criterios y retención de auditoría técnica.
- Consolidar evidencias del runbook de observabilidad y operación.
- Preparar despliegue más allá de Docker Compose con configuración segura.
