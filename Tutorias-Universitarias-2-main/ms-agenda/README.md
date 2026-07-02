ms-agenda/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   └── agenda.routes.js
│   │   ├── controllers/
│   │   │   └── agenda.controller.js
│   │   └── middlewares/
│   │       ├── errorHandler.js
│   │       └── requestLogger.js
│   │
│   ├── domain/
│   │   ├── services/
│   │   │   └── agenda.service.js
│   │   └── models/
│   │       └── Bloqueo.js
│   │
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── agenda.repository.js
│   │
│   ├── config/
│   │   └── index.js
│   │
│   └── app.js
│
├── ... (tests/, docs/, Dockerfile, etc. igual que antes)
└── .env.example


# Instrucciones para la BD
-- Conéctate a la base de datos 'db_agenda'

CREATE TABLE bloqueos (
    idBloqueo UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Usar UUID generado por la BD
    idTutor VARCHAR(50) NOT NULL,
    fechaInicio TIMESTAMPTZ NOT NULL, -- TIMESTAMPTZ guarda la zona horaria (UTC recomendado)
    duracionMinutos INTEGER NOT NULL,
    idEstudiante VARCHAR(50) NOT NULL,
    createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación automática
    CONSTRAINT uq_bloqueos_tutor_fecha_inicio UNIQUE (idTutor, fechaInicio)
);

-- Opcional: Crear un índice para búsquedas rápidas por tutor
CREATE INDEX idx_bloqueos_idTutor ON bloqueos(idTutor);

-- Insertar el bloqueo de ejemplo que tenías
INSERT INTO bloqueos (idTutor, fechaInicio, duracionMinutos, idEstudiante) VALUES
('t54321', '2025-10-22T10:00:00.000Z', 60, 'e12345');
