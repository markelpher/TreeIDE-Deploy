import './css/main.css';
import { createApp } from './createApp.js';

function waitForInterfacePaint() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const app = createApp({ electronAPI: window.electronAPI });
    await app.shell.bootstrap();
    await waitForInterfacePaint();
    window.electronAPI?.rendererReady?.();
});
