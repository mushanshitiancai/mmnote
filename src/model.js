const fs = require('fs-extra');
const p = require("path")
const EventEmitter = require('eventemitter3')
const _ = require("lodash");
const Note = require("./editor/note");
const URI = require('./common/uri');

function runListeners(listeners) {
    for (let listener of listeners) {
        listener()
    }
}

class Model extends EventEmitter {
    static get EVENTS() {
        return {
            projectChange: 'projectChange',
            openNote: 'openNote', // note, index
            activeNote: 'activeNote', // note, index
            closeNote: 'closeNote', // note, index
            updateNote: 'updateNote' // note, index
        }
    }

    constructor() {
        super();
        window._d.model = this;

        // 打开的工程的目录树
        this._treeNodes = []

        // 打开的笔记列表
        this._openNotes = {}
        this._openNoteUriStrOrderArr = []
        this._activeNoteUriStrHistory = []

        // 当前编辑的笔记
        this._activeNote = null;
    }

    emit(...args) {
        console.log("model emit " + args)
        super.emit(...args);
    }

    openProject(folderPath) {
        let stats = fs.statSync(folderPath);
        let name = p.basename(folderPath);
        let rootNode = {
            name, path: folderPath, open: true, children: [], stats: stats
        }
        this._treeNodes.push(rootNode);

        return this._load(folderPath, rootNode).then(() => {
            this.emit(Model.EVENTS.projectChange);
        });
    }

    _load(folderPath, parentNode) {
        return fs.readdir(folderPath).then((files) => {

            let promises = []
            for (let file of files) {
                let filePath = p.join(folderPath, file)
                promises.push(fs.stat(filePath).then((stats) => {
                    let node = { name: file, path: filePath, children: [], stats, uri: URI.file(filePath).toString() }
                    parentNode.children.push(node);
                    if (stats.isDirectory()) {
                        return this._load(filePath, node)
                    }
                }))
            }

            return Promise.all(promises)
        })
    }

    _getNoteIndex(note) {
        return _.findIndex(this._openNoteUriStrOrderArr, x => x === note.uriString);
    }

    _getActiveNoteIndex(note) {
        if (!note) return -1;
        return this._getNoteIndex(note);
    }

    openNote(note) {
        if (typeof note === 'string') note = Note.create(note);
        if (this._activeNote === note) return;
        if (this._openNotes[note.uriString]) {
            return this.activeNote(note);
        }

        this._openNotes[note.uriString] = note;
        this._openNoteUriStrOrderArr.splice(this._getActiveNoteIndex() + 1, 0, note.uriString);

        this.emit(Model.EVENTS.openNote, note);
        this.activeNote(note);
    }

    activeNote(note) {
        if (typeof note === 'string') note = Note.create(note);
        if (this._activeNote === note) return;

        this._activeNote = note;
        this._activeNoteUriStrHistory.push(note.uriString);

        this.emit(Model.EVENTS.activeNote, note);
    }

    _activePrevNote() {
        this._activeNoteUriStrHistory.pop()
        let lastActiveTabUriStr = _.last(this._activeNoteUriStrHistory)
        if(!lastActiveTabUriStr) return;

        this._activeNote = this._openNotes[lastActiveTabUriStr]

         this.emit(Model.EVENTS.activeNote, this._activeNote);
    }

    closeNote(note) {
        if (typeof note === 'string') note = Note.create(note);
        if (!this._openNotes[note.uriString]) {
            return;
        }

        let noteIndex = this._getNoteIndex(note)
        delete this._openNotes[note.uriString]
        _.pull(this._openNoteUriStrOrderArr, note.uriString)

        if (this._activeNote === note) {
            this._activePrevNote()
        }

        this.emit(Model.EVENTS.closeNote, note, noteIndex);
    }
}

module.exports = Model;