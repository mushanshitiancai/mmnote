const p = require('path');
const URI = require('../common/uri');
const MIME = require('mime');
const _ = require('lodash');


// note数据结构
class Note {
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
        this._uri = uri;
        this._mime = mime || MIME.lookup(uri.fsPath);
    }

    get uri() {
        return this._uri;
    }

    get mime() {
        return this._mime;
    }

    get name() {
        return p.basename(this.uri.fsPath)
    }

    get isUnTitled() {
        return this.uri.scheme === Note.UNTITLE_SCHEME;
    }
}

Note.UNTITLE_SCHEME = 'untitled';
Note.NOTE_CACHE = {};

window._note = Note;
module.exports = Note;