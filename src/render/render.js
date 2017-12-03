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
const CommandService = require("./command/commander")
const URI = require("../common/uri");
const IPCRender = require("./ipc-render");

const { KeyBindingService,ShortcutKey } = require('./key/key-binding-service')

let k = ShortcutKey.createFromString('ctrl+alt+a')
console.log(k);
console.log(k.toString());

window._d = {}
window._d.process = process;
window._d.path = p;
window._d.uri = URI;
console.log(URI.file('c:/win/path'));

window.addEventListener('keydown', (e) => {
    console.log("window: ", e.ctrlKey, e.altKey, e.metaKey, e.shiftKey, e.key, e.keyCode)
    // e.stopPropagation();
    // e.stopImmediatePropagation()
}, true);

const Note = require("./editor/note");

let ipcRender = new IPCRender();
let model = new Model();
window.model = model;

let commandService = new CommandService(model, ipcRender);
let keyBindingService = new KeyBindingService(commandService);
let tree = new Tree($("#tree"), model)
let tabBar = new TabBar($("#tabs"), model)
let noteEditor = new NoteEditor($("#cm-container"))
let minderEditor = new MinderEditor($("#km-container"))
let editorController = new EditorController($("#editor-stack-container"), model)

editorController.registerEditor('application/javascript', noteEditor)
editorController.registerEditor('text/markdown', noteEditor)
editorController.registerEditor(constant.mime.minder, minderEditor)

model.openProject(p.join(process.cwd(), "demo-note"));
model.openNote(Note.create(p.join(process.cwd(), 'demo-note/b.mmm'), constant.mime.minder));
// model.openNote(Note.createUntitle('s','text/markdown'));

keyBindingService.register("cmd+n", "newMdNote");
keyBindingService.register("cmd+s", "save");
keyBindingService.startListen();
