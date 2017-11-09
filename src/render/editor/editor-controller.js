const MIME = require('mime');
const Model = require('../model');
const _ = require('lodash');

class EditorController {
    constructor($container, omodel) {
        this._$container = $container;
        this._editorMap = new Map();

        model.on(Model.EVENTS.reset, (target) => {
            this._reset();
        });

        model.on(Model.EVENTS.openNote, (target, note, index) => {
            this.openNote(note)
        });

        model.on(Model.EVENTS.activeNote, (target, note, index) => {
            this.openNote(note)
        });

        model.on(Model.EVENTS.closeNote, (target, note, index) => {
            this.closeNote(note, index)
        });
    }

    _reset(){
        this._showNoNoteBackground();
        this._editorMap.forEach(editor => {
            editor.reset();
        })
    }

    registerEditor(mimeStr, editor) {
        this._editorMap.set(mimeStr, editor);
    }

    getEditorByMime(mimeStr) {
        return this._editorMap.get(mimeStr)
    }

    openNote(note) {
        if(!note) return;
        let targetEditor = this.getEditorByMime(note.mime)
        if (targetEditor) {
            targetEditor.open(note)

           this._editorMap.forEach((editor) => {
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
        this._editorMap.forEach((editor) => {
            editor.$container.css('z-index', '-1')
        });
        this._$container.find('#backgroud-container').css('z-index', '0');
    }
}

module.exports = EditorController;