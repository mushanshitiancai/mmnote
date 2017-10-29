const p = require('path');
const URI = require('../common/uri');
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

    static createUntitle(name, mime) {
        let uri = URI.create(Note.UNTITLE_SCHEME).withPath(name);
        let uriString = uri.toString();
        if (!Note.NOTE_CACHE[uriString]) {
            Note.NOTE_CACHE[uriString] = new Note(uri, mime)
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
    }

    get uri() {
        return this._uri;
    }

    get mime() {
        return this._mime;
    }

    get name() {
        return p.basename(this._uri.fsPath)
    }

    get isUnTitled() {
        return this.uri.scheme === Note.UNTITLE_SCHEME;
    }

    readContent() {
        if (!this._content) {
            this._rawContent = fs.readFileSync(this._uri.fsPath, 'utf-8')
            this._content = this._rawContent;
        }
        return this._content;
    }

    update(content){
        this._content = content;
        this.emit(Note.EVENTS.update, content);
    }
}

Note.UNTITLE_SCHEME = 'untitled';
Note.NOTE_CACHE = {};
Note.EVENTS = {
    update: 'update'
}

window._note = Note;
module.exports = Note;