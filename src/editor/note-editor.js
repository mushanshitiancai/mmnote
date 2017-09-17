const fs = require("fs")

class NoteEditor{
    constructor($container){
        this.$container = $container
        this.cm = CodeMirror($container.get(0))        
    }

    open(filePath){
        let content = fs.readFileSync(filePath,'utf-8')

        this.cm.setValue(content);
    }
}


module.exports = NoteEditor