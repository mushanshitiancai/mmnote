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
        this._openNoteMap = new Map();
        this._openNoteUriStrOrderArr = []
        this._activeNoteUriStrHistory = []

        // 当前编辑的笔记
        this._activeNote = null;
    }

    emit(...args) {
        console.log(`Model emit[%c${args[0]}%c] ${args.slice(1)}`, 'color:red','')
        this._log();
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
        if (!note) return -1;
        return this._openNoteUriStrOrderArr.indexOf(note.uriString);
    }

    _getActiveNoteIndex() {
        return this._getNoteIndex(this._activeNote);
    }

    openNote(note) {
        if (typeof note === 'string') note = Note.create(note);
        if (this._activeNote === note) return;
        if (this._openNoteMap.has(note.uriString)) {
            return this.activeNote(note);
        }

        this._openNoteMap.set(note.uriString, note);

        let curNoteIdex = this._getActiveNoteIndex() + 1
        this._openNoteUriStrOrderArr.splice(curNoteIdex, 0, note.uriString);

        this.emit(Model.EVENTS.openNote, note, curNoteIdex);
        this.activeNote(note);
    }

    activeNote(note) {
        if (typeof note === 'string') note = Note.create(note);
        if (this._activeNote === note) return;

        this._activeNote = note;
        this._activeNoteUriStrHistory.push(note.uriString);
        let activeNoteIndex = this._getActiveNoteIndex();

        this.emit(Model.EVENTS.activeNote, note, activeNoteIndex);
    }

    _activePrevNote() {
        this._activeNoteUriStrHistory.pop()
        let lastActiveTabUriStr = _.last(this._activeNoteUriStrHistory)
        if(!lastActiveTabUriStr) return;

        this._activeNote = this._openNoteMap.get(lastActiveTabUriStr)

         this.emit(Model.EVENTS.activeNote, this._activeNote);
    }

    closeNote(note) {
        if (typeof note === 'string') note = Note.create(note);
        if (!this._openNoteMap.has(note.uriString)) {
            return;
        }

        let noteIndex = this._getNoteIndex(note)
        this._openNoteMap.delete(note.uriString)
        _.pull(this._openNoteUriStrOrderArr, note.uriString)
        _.pull(this._activeNoteUriStrHistory, note.uriString)

        if (this._activeNote === note) {
            this._activePrevNote()
        }

        this.emit(Model.EVENTS.closeNote, note, noteIndex);
    }

    _log(){
        let prefix = '    '
        let prefix2 = '      '
        console.log(prefix + "_openNotes: \n" + _.map(this._openNoteMap, x => prefix2 + x.uriString).join("\n"));
        console.log(prefix + "_openNoteUriStrOrderArr: \n" + _.map(this._openNoteUriStrOrderArr, x => prefix2 + x).join("\n"));
    }
}

module.exports = Model;