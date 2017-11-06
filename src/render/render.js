const constant = require("../common/constant")
const fs = require("fs")
const p = require("path")
const Tree = require("./tree")
const TabBar = require("./tab-bar").TabBar
const Tab = require("./tab-bar").Tab
const EditorController = require("./editor/editor-controller")
const NoteEditor = require("./editor/note-editor")
const MinderEditor = require("./editor/minder-editor")
const Model = require("./model")
const Commander = require("./command/commander")
const URI = require("../common/uri");

window._d = {}
window._d.process = process;
window._d.path = p;
window._d.uri = URI;
console.log(URI.file('c:/win/path')); 

const Note = require("./editor/note");

let model = new Model();
window.model = model;

let commander = new Commander(model);
let tree = new Tree($("#tree"), model)
let tabBar = new TabBar($("#tabs"), model)
let noteEditor = new NoteEditor($("#cm-container"))
let minderEditor = new MinderEditor($("#km-container"))
let editorController = new EditorController($("#editor-stack-container"), model)

editorController.registerEditor('application/javascript', noteEditor)
editorController.registerEditor('text/markdown', noteEditor)
editorController.registerEditor(constant.mime.minder, minderEditor)

model.openProject(p.join(process.cwd(), "demo-note"));
model.openNote(Note.create(p.join(process.cwd(), 'src/render/css/minder.css'),'text/markdown'));
// model.openNote(Note.createUntitle('s','text/markdown'));


