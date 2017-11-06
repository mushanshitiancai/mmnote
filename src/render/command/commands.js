const { dialog } = require('electron').remote

let Commands = {
    openProject: {
        run: function (model) {
            let path = dialog.showOpenDialog({ properties: ['openDirectory'] })
            if (path && path.length == 1) {
                model.openProject(path[0]);
            }
        }
    },
    newMdNote: {
        run: function (model) {
            
        }
    },
    closeNote: {
        run: function (model, notePath) {
            model.closeNote(notePath);
        }
    },
    save: {
        run: function(model){
            model.saveNote();
        }
    }
}

module.exports = Commands;