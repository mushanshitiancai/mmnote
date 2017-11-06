const Commands = require("./commands")

/**
 * 界面上的按钮会触发Command。data-command指定命令名，data-command-arg指定参数。
 */
class Commander {
    constructor(model, ipcRender) {
        this.model = model;
        let _this = this;

        ipcRender.onCommandSendFromMain((command, args) => {
            _this.exec(command, ...args);
        });

        $('body').on('click', "[data-command]", function () {
            let command = $(this).attr('data-command');
            let arg = $(this).attr('data-command-arg');
            _this.exec(command, arg);
        });
    }

    exec(command, ...args) {
        console.log(`exec command:[%c${command}%c] args: ${args}`,'color:red;','');

        let commandObj = Commands[command];
        if(!commandObj){
            throw new Error(`command "${command}" not exist`);
        }
        commandObj.run(this.model, ...args);
    }
}

module.exports = Commander;

