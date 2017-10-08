const fs = require("fs")
require("./codemirror-ext")



class NoteEditor{
    constructor($container){
        this.$container = $container
        this.cm = CodeMirror($container.get(0))        
    }

    open(filePath){
        this.cm.mmSwapDocByUrl(filePath, 'gfm', ()=>{
            return fs.readFileSync(filePath,'utf-8')
        });
        this.cm.focus();
    }
}




module.exports = NoteEditor