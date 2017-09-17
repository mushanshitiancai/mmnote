const fs = require('fs-extra');
const p = require("path")
const EventEmitter = require('eventemitter3')
const _ = require("lodash");

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
            activeNote: 'activeNote'
        }
    }

    constructor() {
        super();

        // 打开的工程的目录树
        this._treeNodes = []

        // 打开的笔记的path列表
        this._openNotes = []

        // 当前编辑的笔记
        this._activeNote = null;
    }

    emit(...args){
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
                    let node = { name: file, path: filePath, children: [], stats }
                    parentNode.children.push(node);
                    if (stats.isDirectory()) {
                        return this._load(filePath, node)
                    }
                }))
            }

            return Promise.all(promises)
        })
    }

    openNote(notePath){
        if(this._activeNote === notePath) return;
        if(_.includes(this._openNotes, notePath)){
            return this.activeNote(notePath);
        }

        this._openNotes.push(notePath);
        this._activeNote = notePath;
        this.emit(Model.EVENTS.openNote);
    }

    activeNote(notePath){
        if(this._activeNote === notePath) return;

        this._activeNote = notePath;
        this.emit(Model.EVENTS.activeNote);
    }
}

module.exports = Model;