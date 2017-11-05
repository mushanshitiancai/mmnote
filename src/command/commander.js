const Commands = require("./commands")
const {ipcRenderer} = require('electron')

/**
 * 界面上的按钮会触发Command。data-command指定命令名，data-command-arg指定参数。
 */
class Commander {
    constructor(model) {
        this.model = model;
        let _this = this;

        ipcRenderer.on("command", (event, arg) => {
            console.log(arguments);
        })

        $('body').on('click', "[data-command]", function () {
            let command = $(this).attr('data-command');
            let arg = $(this).attr('data-command-arg');
            _this.exec(command, arg);
        });
    }

    exec(command, ...args) {
        console.log("exec command: " + command + " args: " + args);
        Commands[command].run(this.model, ...args);
    }
}

module.exports = Commander;

