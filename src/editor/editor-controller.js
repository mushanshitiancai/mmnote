const MIME = require('mime');
const Model = require('../model');

class EditorController {
    constructor($container, omodel) {
        this.$container = $container
        this.editors = {}

        model.on(Model.EVENTS.openNote, (path) => {
            this.open(path)
        });

        model.on(Model.EVENTS.activeNote, (path) => {
            this.open(path)
        });
    }

    registerEditor(mimeStr, editor) {
        this.editors[mimeStr] = editor
    }

    open(note) {
        if (this.editors[note.mime]) {
            let curEditor = this.editors[note.mime]
            curEditor.open(note)

            this.mapAllEditor((editor) => {
                editor.$container.css('z-index', '0')
            })
            curEditor.$container.css('z-index', '1')
        }
    }

    mapAllEditor(cb) {
        for (let mime in this.editors) {
            if (this.editors.hasOwnProperty(mime)) {
                cb(this.editors[mime])
            }
        }
    }
}

module.exports = EditorController;