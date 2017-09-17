const constant = require("./constant")
const fs = require("fs")
const Tree = require("./tree")
const Tabs = require("./tabs")
const EditorController = require("./editor/editor-controller")
const NoteEditor = require("./editor/note-editor")
const MinderEditor = require("./editor/minder-editor")
const Model = require("./model")
const Commander = require("./command/commander")

let model = new Model();
window.model = model;

let commander = new Commander(model);
let tree = new Tree($("#tree"), model)
let tabs = new Tabs($("#tabs"), model)
let noteEditor = new NoteEditor($("#cm-container"))
let minderEditor = new MinderEditor($("#km-container"))
let editorController = new EditorController($("#editor-stack-container"))

editorController.registerEditor('application/javascript', noteEditor)
editorController.registerEditor('text/markdown', noteEditor)
editorController.registerEditor(constant.mime.minder, minderEditor)

model.openProject("demo-note");

// tree.load("demo-note")
// tree.onClick = function (node) {
//     if (node.stats.isFile()) {
//         tabs.addTab(node.path, node.name, node)
//         editorController.open(node.path)
//     }
// }
// tabs.onTabActive = function (id, index, meta, $tab) {
//     console.log(id, index, meta, $tab)
//     editorController.open(meta.path)
// }

// tabs.onTabClose = function (id, index, meta, $tab) {

// }


