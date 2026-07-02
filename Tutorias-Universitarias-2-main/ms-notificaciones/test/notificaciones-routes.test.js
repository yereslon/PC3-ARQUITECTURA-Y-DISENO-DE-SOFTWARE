const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, beforeEach, test } = require('node:test');

const emailProviderPath = require.resolve('../src/infrastructure/providers/email.provider');
const producerPath = require.resolve('../src/infrastructure/messaging/message.producer');

const calls = {
    enviarEmail: []
};

require.cache[emailProviderPath] = {
    id: emailProviderPath,
    filename: emailProviderPath,
    loaded: true,
    exports: {
        enviarEmail: async (destinatario, asunto, cuerpo) => {
            calls.enviarEmail.push({ destinatario, asunto, cuerpo });
            return { estado: 'ENVIADO' };
        }
    }
};

require.cache[producerPath] = {
    id: producerPath,
    filename: producerPath,
    loaded: true,
    exports: {
        connect: async () => undefined,
        track: () => undefined
    }
};

const notificacionService = require('../src/domain/services/notificacion.service');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

beforeEach(() => {
    calls.enviarEmail = [];
});

const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            'content-type': 'application/json',
            ...(options.headers || {})
        }
    });

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    return {
        status: response.status,
        contentType,
        body: contentType.includes('application/json') && text ? JSON.parse(text) : text
    };
};

test('notification service exports the compatibility function used by the HTTP route', () => {
    assert.equal(typeof notificacionService.enviarNotificacion, 'function');
    assert.equal(typeof notificacionService.enviarEmailNotificacion, 'function');
});

test('POST /notificaciones/:canal uses enviarNotificacion-compatible payload and returns accepted log', async () => {
    const response = await request('/notificaciones/email', {
        method: 'POST',
        body: JSON.stringify({
            destinatario: 'student@example.com',
            asunto: 'Tutoría confirmada',
            cuerpo: 'Tu tutoría fue confirmada.'
        })
    });

    assert.equal(response.status, 202);
    assert.equal(response.body.canal, 'email');
    assert.equal(response.body.destinatario, 'student@example.com');
    assert.equal(response.body.estado, 'ENVIADO');
    assert.deepEqual(calls.enviarEmail, [{
        destinatario: 'student@example.com',
        asunto: 'Tutoría confirmada',
        cuerpo: 'Tu tutoría fue confirmada.'
    }]);
});

test('GET /metrics exposes Prometheus metrics without starting RabbitMQ consumers', async () => {
    const response = await request('/metrics', {
        method: 'GET',
        headers: { accept: 'text/plain' }
    });

    assert.equal(response.status, 200);
    assert.match(response.contentType, /text\/plain/);
    assert.match(response.body, /^up 1$/m);
    assert.match(response.body, /service_name="MS_Notificaciones"/);
});
