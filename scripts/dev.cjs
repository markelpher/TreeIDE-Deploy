/**
 * Dev mode: Vite renderer server + Electron main process.
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, '..');
const port = Number(process.env.VITE_PORT) || 5173;
const devServerUrl = `http://127.0.0.1:${port}`;

function waitForServer(url, timeoutMs = 30000) {
    const started = Date.now();
    return new Promise((resolve, reject) => {
        const tick = () => {
            const req = http.get(url, (res) => {
                res.resume();
                resolve();
            });
            req.on('error', () => {
                if (Date.now() - started > timeoutMs) {
                    reject(new Error(`Timed out waiting for ${url}`));
                    return;
                }
                setTimeout(tick, 250);
            });
        };
        tick();
    });
}

const vite = spawn('npx.cmd', ['vite', '--port', String(port)], {
    cwd: root,
    stdio: 'inherit',
    shell: true
});

let electronChild = null;

const shutdown = (code = 0) => {
    if (electronChild && !electronChild.killed) {
        electronChild.kill();
    }
    if (vite && !vite.killed) {
        vite.kill();
    }
    process.exit(code);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

vite.on('exit', (code) => {
    if (electronChild) { shutdown(code ?? 1); }
});

waitForServer(devServerUrl)
    .then(() => {
        const env = { ...process.env, TREEIDE_DEV_SERVER: devServerUrl };
        delete env.ELECTRON_RUN_AS_NODE;
        const electronPath = require(path.join(root, 'node_modules', 'electron'));
        electronChild = spawn(electronPath, ['.'], {
            cwd: root,
            stdio: 'inherit',
            env
        });
        electronChild.on('exit', (code) => shutdown(code ?? 0));
    })
    .catch((err) => {
        console.error(err.message);
        shutdown(1);
    });