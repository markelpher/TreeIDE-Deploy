import './css/main.css';
import { createApp } from './createApp.js';

window.addEventListener('DOMContentLoaded', () => {
    const app = createApp({ electronAPI: window.electronAPI });
    void app.shell.bootstrap();
});