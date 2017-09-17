const EventEmitter = require('eventemitter3')
const Model = require('./model');

class Tree extends EventEmitter{

    constructor($container, model) {
        super();
        this.$containere = $container
        this.setting = {
            callback: {
                onClick: (event, treeId, treeNode) => {
                    console.log(treeNode);
                    model.openNote(treeNode.path);
                }
            }
        }
        this.nodes = []
        // this.zTree = $.fn.zTree.init(treeDom, this.setting, this.nodes);

        model.on(Model.EVENTS.projectChange, () => {
            this.zTree = $.fn.zTree.init(this.$containere, this.setting, model._treeNodes);
        });
    }
}

module.exports = Tree