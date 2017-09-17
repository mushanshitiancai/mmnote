const Commands = require("./commands")

class Commander {
    constructor(model){
        this.model = model;

        let _this = this;
        $("button[data-command]").click(function(){
            let command = $(this).attr('data-command')
            _this.exec(command);
        });
    }

    exec(command, ...args){
        Commands[command].run(this.model, ...args);
    }
}

module.exports = Commander;

