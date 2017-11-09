const p = require('path');
const URI = require('../../common/uri');
const MIME = require('mime');
const _ = require('lodash');
const fs = require("fs-extra")
const EventEmitter = require('eventemitter3')

// note数据结构
class Note extends EventEmitter {

    static create(uri, mime) {
        if (typeof uri === 'string') {
            uri = URI.parse(uri);
        }

        let uriString = uri.toString();
        if (!Note.NOTE_CACHE[uriString]) {
            Note.NOTE_CACHE[uriString] = new Note(uri, mime)
        }

        return Note.NOTE_CACHE[uriString];
    }

    static createUntitle(index, mime) {
        let name = index == 0 ? Note.UNTITLE_PREFIX : `${Note.UNTITLE_PREFIX}(${index})`
        let uri = URI.create(Note.UNTITLE_SCHEME).withPath(name);
        let uriString = uri.toString();
        if (!Note.NOTE_CACHE[uriString]) {
            Note.NOTE_CACHE[uriString] = new Note(uri, mime)
            Note.NOTE_CACHE[uriString]._untitledIndex = index;
        }

        return Note.NOTE_CACHE[uriString];
    }

    constructor(uri, mime) {
        super();
        this._uri = uri;
        this._mime = mime || MIME.lookup(uri.fsPath);
        this._rawContent = null;
        this._content = null;
        this._isDirty = false;
        this._untitledIndex = null;
    }

    emit(...args) {
        if (args[0] == 'update') {
            console.log(`Note emit[%c${args[0]}%c]`, 'color:red', '')
        } else {
            console.log(`Note emit[%c${args[0]}%c] ${args.slice(2)}`, 'color:red', '')
        }
        super.emit(...args);
    }

    get uri() {
        return this._uri;
    }

    get uriString() {
        return this._uri.toString();
    }

    get mime() {
        return this._mime;
    }

    get name() {
        return p.basename(this._uri.fsPath)
    }

    get isDirty() {
        return this._isDirty;
    }

    get isUnTitled() {
        return this.uri.scheme === Note.UNTITLE_SCHEME;
    }

    get untitledIndex() {
        return this._untitledIndex;
    }

    readContent() {
        if (!this._content) {
            if (this.isUnTitled) {
                this._rawContent = this._content = "untitled"
            } else {
                this._rawContent = fs.readFileSync(this._uri.fsPath, 'utf-8')
                this._content = this._rawContent;
            }
        }
        return this._content;
    }

    update(content) {
        this._content = content;
        this._isDirty = this._content != this._rawContent;
        this.emit(Note.EVENTS.update, this);
    }

    save() {
        if(!this._rawContent || !this._content) return;
        fs.writeFileSync(this._uri.fsPath, this._content, 'utf-8');
        this._rawContent = this._content;
        this._isDirty = false;
        this.emit(Note.EVENTS.save, this);
    }

    // delete from cache
    close() {
        delete Note.NOTE_CACHE[this._uri.toString()]
    }

    toString() {
        return `Note(${this._uri.toString()})`
    }

    static emptyCache(){
        Note.NOTE_CACHE = {};
    }
}

Note.UNTITLE_SCHEME = 'untitled';
Note.UNTITLE_PREFIX = 'untitled';
Note.NOTE_CACHE = {};
Note.EVENTS = {
    update: 'update',
    save: 'save'
}

window._note = Note;
module.exports = Note;