const {dialog} = require('electron').remote

let Commands = {
    openProject: {
        run: function (model) {
            let path = dialog.showOpenDialog({properties: ['openDirectory']})
            if(path.length == 1){
                model.openProject(path[0]);
            }
        }
    },
    newMdNote: {
        run: function () {

        }
    }
}

module.exports = Commands;