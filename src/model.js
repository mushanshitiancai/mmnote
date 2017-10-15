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
            openNote: 'openNote',
            activeNote: 'activeNote',
            closeNote: 'closeNote'
        }
    }

    constructor() {
        super();
        window._model = this;

        // 打开的工程的目录树
        this._treeNodes = []

        // 打开的笔记的path列表
        this._openNotes = []

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
                    let node = { name: file, path: filePath, children: [], stats , uri: URI.file(filePath).toString()}
                    parentNode.children.push(node);
                    if (stats.isDirectory()) {
                        return this._load(filePath, node)
                    }
                }))
            }

            return Promise.all(promises)
        })
    }

    openNote(note) {
        if (this._activeNote === note) return;
        if (_.includes(this._openNotes, note)) {
            return this.activeNote(note);
        }

        this._openNotes.push(note);
        this._activeNote = note;
        this.emit(Model.EVENTS.openNote, note);
    }

    activeNote(note) {
        if(typeof note === 'string') note = Note.create(note);
        if (this._activeNote === note) return;

        this._activeNote = note;
        this.emit(Model.EVENTS.activeNote, note);
    }

    closeNote(note) {
        if (!_.includes(this._openNotes, note)) {
            return;
        }

        _.pull(this._openNotes, note);
        if (this._activeNote === note) {
            if (this._openNotes.length == 0) {
                this._activeNote = null
            } else {
                this._activeNote = this._openNotes[this._openNotes.length - 1];
            }
        }
        this.emit(Model.EVENTS.closeNote, note, this._activeNote);
    }
}

module.exports = Model;