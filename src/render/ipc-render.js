const { ipcRenderer } = require('electron');

class IPCRender {

    constructor() {

    }

    onCommandSendFromMain(callback) {
        ipcRenderer.on('command', (event, command, args) => {
            callback(command, args);
        });
    }
}

module.exports = IPCRender;
