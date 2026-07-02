const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, test } = require('node:test');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SERVICE_NAME = 'MS_Auth';

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

test('GET /metrics exposes Prometheus metrics without starting the service listener', async () => {
    await fetch(`${baseUrl}/metrics-probe`);

    const response = await fetch(`${baseUrl}/metrics`, {
        method: 'GET',
        headers: { accept: 'text/plain' }
    });

    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /text\/plain/);
    assert.match(body, /^up 1$/m);
    assert.match(body, /service_name="MS_Auth"/);
});
