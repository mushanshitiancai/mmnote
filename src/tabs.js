const _ = require("lodash")
const p = require("path")
const EventEmitter = require('eventemitter3')
const Model = require('./model');

class Tabs extends EventEmitter {

    constructor($container, model) {
        super();
        window._tabs = this;

        this.model = model;
        this.$container = $container
        this.itemMap = {}
        this.activeItemId = null

        model.on(Model.EVENTS.openNote, (note) => {
            this.addTab(note.uri.toString(), note.name, null);
        });

        model.on(Model.EVENTS.activeNote, (note) => {
            this.activeTabById(note.uri.toString());
        });

        model.on(Model.EVENTS.closeNote, (note, nextNote) => {
            this.closeTab(note.uri.toString(), nextNote.uri.toString());
        });
    }

    addTab(id, name, meta, active = true) {
        if (this.itemMap[id]) {
            this.activeTabById(id, true)
            return
        }

        let newIndex = _.size(this.itemMap)

        let model = this.model;
        let $close = $('<span>', {
            class: "icon icon-cancel icon-close-tab",
            click: function () {
                let tabId = $(this).parent('.tab-item').data("id");
                model.closeNote(tabId);
            }
        })
        let $title = $("<span>", {
            class: "title",
            text: name
        })
        let $listItem = $("<div>", {
            class: "tab-item",
            data: {
                id,
                name,
                newIndex,
                meta
            },
            click: function () {
                let curId = $(this).data("id")
                model.activeNote(curId);
            }
        })
        let that = this

        $listItem.append($close)
        $listItem.append($title)
        // $listItem.text(name)
        this.$container.append($listItem)

        this.itemMap[id] = $listItem
        if (newIndex == 0 || active) {
            this.activeTabById(id, false)
        }
    }

    closeTab(id, nextId) {
        if (this.itemMap[id]) {
            this.itemMap[id].remove();
            delete this.itemMap[id];
            this.activeItemId = null;
            this.activeTabById(nextId, true);
        }
    }

    activeTabById(id, isCallCB) {
        if (id == this.activeItemId) return

        let $tab = this.itemMap[id]
        if ($tab) {
            if (this.activeItemId) {
                let $prevActiveItem = this.itemMap[this.activeItemId]
                $prevActiveItem.removeClass("active")
            }
            $tab.addClass("active")

            this.activeItemId = id

            if (isCallCB && this.onTabActive) {
                let index = $tab.data("index")
                let meta = $tab.data("meta")
                this.onTabActive(id, index, meta, $tab)
            }
        }
    }

    dirtyTab(id) {
        let $tab = this.itemMap[id]
        if ($tab) {

        }
    }
}

class Tab extends EventEmitter{
    constructor(id, name) {
        this.id = id;
        this.name = name;

        this.$tab = $('<div>', {
            class: "tab",
            click: function () {
                model.activeNote(id);
            }
        });

        let $close = $('<span>', {
            class: "icon icon-cancel icon-close-tab",
            click: function () {
                let tabId = $(this).parent('.tab-item').data("id");
                model.closeNote(tabId);
            }
        }).appendTo(this.$tab);
        
        let $title = $("<span>", {
            class: "title",
            text: name
        }).appendTo(this.$tab);
    }

    getId(){
        return this.id;
    }

    getName(){
        return this.name;
    }
}

module.exports = Tabs