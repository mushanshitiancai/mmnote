const fs = require("fs")
// require("./codemirror-ext")

class NoteEditor {
    constructor($container) {
        this.$container = $container
        this._codeMirror = CodeMirror($container.get(0))

        // let events = ['change','changes','beforeChange']
        // events.forEach( (event) => {
        //     this.cm.on(event, function (cm, arg1) {
        //         console.log("codemirror event: " + event, arg1);
        //     });
        // });

        this._codeMirror.on('change', (cm, changeObj) => {
            let doc = cm.getDoc();
            let note = doc._context.note;
            note.update(doc.getValue()); // getValue()是否低效？
        })
    }

    reset() {
        this._docMap = new Map();
    }

    open(note) {
        if (!this._docMap.has(note.uriString)) {
            let newDoc = CodeMirror.Doc(note.readContent(), 'gfm');
            newDoc._context = {
                note: note
            };
            this._docMap.set(note.uriString, newDoc);
        }

        this._codeMirror.swapDoc(this._docMap.get(note.uriString))
        this._codeMirror.focus();
    }

    close(note) {
        this._docMap.delete(note.uriString)
    }
}




module.exports = NoteEditor