const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, beforeEach, test } = require('node:test');

process.env.SERVICE_NAME = 'MS_Usuarios';

const dbPath = require.resolve('../src/config/db');
const producerPath = require.resolve('../src/infrastructure/messaging/message.producer');

let queryImpl = async () => ({ rows: [] });

require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
        query: (text, params) => queryImpl(text, params)
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

const usuariosRepository = require('../src/infrastructure/repositories/usuarios.repository');
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
    queryImpl = async () => ({ rows: [] });
});

test('GET /metrics exposes Prometheus metrics without connecting to RabbitMQ or PostgreSQL', async () => {
    await fetch(`${baseUrl}/metrics-probe`);

    const response = await fetch(`${baseUrl}/metrics`, {
        method: 'GET',
        headers: { accept: 'text/plain' }
    });

    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /text\/plain/);
    assert.match(body, /^up 1$/m);
    assert.match(body, /service_name="MS_Usuarios"/);
});

test('repository maps undefined estudiantes table errors to an initialization contract', async () => {
    const dbError = new Error('relation "estudiantes" does not exist');
    dbError.code = '42P01';
    dbError.stack = dbError.message;
    queryImpl = async () => { throw dbError; };

    await assert.rejects(
        () => usuariosRepository.findEstudianteById('estudiante-1'),
        (error) => {
            assert.equal(error.statusCode, 500);
            assert.equal(error.code, '42P01');
            assert.equal(error.cause, dbError);
            assert.match(error.message, /falta la tabla estudiantes/i);
            return true;
        }
    );
});

test('repository preserves non-schema database errors', async () => {
    const dbError = new Error('connection refused');
    dbError.code = 'ECONNREFUSED';
    dbError.stack = dbError.message;
    queryImpl = async () => { throw dbError; };

    await assert.rejects(
        () => usuariosRepository.findTutorById('tutor-1'),
        (error) => error === dbError
    );
});
