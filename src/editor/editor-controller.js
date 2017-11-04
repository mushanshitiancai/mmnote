const MIME = require('mime');
const Model = require('../model');
const _ = require('lodash');

class EditorController {
    constructor($container, omodel) {
        this.$container = $container
        this.editors = {}

        model.on(Model.EVENTS.openNote, (note, index) => {
            this.openNote(note)
        });

        model.on(Model.EVENTS.activeNote, (note, index) => {
            this.openNote(note)
        });

        model.on(Model.EVENTS.closeNote, (note, index) => {
            this.closeNote(note, index)
        });
    }

    registerEditor(mimeStr, editor) {
        this.editors[mimeStr] = editor
    }

    getEditorByMime(mimeStr) {
        return this.editors[mimeStr]
    }

    openNote(note) {
        let targetEditor = this.getEditorByMime(note.mime)
        if (targetEditor) {
            targetEditor.open(note)

            this.mapAllEditor((editor) => {
                editor.$container.css('z-index', '-1')
            })
            targetEditor.$container.css('z-index', '1')
        }
    }

    closeNote(note, index) {
        let targetEditor = this.getEditorByMime(note.mime)
        if (targetEditor) {
            targetEditor.close(note)
        }

        if (index == 0 && model._openNoteMap.size == 0) {
            this._showNoNoteBackground();
        }
    }

    _showNoNoteBackground() {
        this.mapAllEditor((editor) => {
            editor.$container.css('z-index', '-1')
        });
        this.$container.find('#backgroud-container').css('z-index', '0');
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