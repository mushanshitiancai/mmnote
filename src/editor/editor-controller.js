const mime = require('mime');
const Model = require('../model');

class EditorController {
    constructor($container, model) {
        this.$container = $container
        this.editors = {}

        model.on(Model.EVENTS.openNote, (path)=>{
            this.open(path)
        });

         model.on(Model.EVENTS.activeNote, (path)=>{
            this.open(path)
        });
    }

    registerEditor(mimeStr, editor) {
        this.editors[mimeStr] = editor
    }

    open(path, mimeStr) {
        if(!mimeStr) mimeStr = mime.lookup(path)
        if (this.editors[mimeStr]) {
            let curEditor = this.editors[mimeStr]
            curEditor.open(path)

            this.mapAllEditor((editor) => {
                editor.$container.css('z-index','0')
            })
            curEditor.$container.css('z-index','1')
        }
    }

    mapAllEditor(cb){
        for(let mime in this.editors){
            if(this.editors.hasOwnProperty(mime)){
                cb(this.editors[mime])
            }
        }
    }
}

module.exports = EditorController;