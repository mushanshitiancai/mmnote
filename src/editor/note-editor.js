const fs = require("fs")
require("./codemirror-ext")



class NoteEditor {
    constructor($container) {
        this.$container = $container
        this.cm = CodeMirror($container.get(0))
    }

    openByFsPath(filePath) {
        this.cm.mmSwapDocByUrl(filePath, 'gfm', () => {
            return fs.readFileSync(filePath, 'utf-8')
        });
        this.cm.focus();
    }

    open(note) {
        if (!note.isUnTitled) {
            this.openByFsPath(note.uri.fsPath);
        } else {
            this.cm.mmSwapDocByUrl(note.uri.toString(), 'gfm', () => {
                return "untitled"
            });
            this.cm.focus();
        }
    }
}




module.exports = NoteEditor