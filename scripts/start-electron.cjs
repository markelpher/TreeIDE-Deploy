const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronPath = require(path.join(root, 'node_modules', 'electron'));
const child = spawn(electronPath, ['.'], {
    cwd: root,
    stdio: 'inherit',
    env
});

child.on('exit', (code, signal) => {
    if (code === null) {
        console.error('Electron exited with signal', signal);
        process.exit(1);
    }
    process.exit(code);
});