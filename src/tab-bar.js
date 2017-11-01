const _ = require("lodash")
const p = require("path")
const EventEmitter = require('eventemitter3')
const Model = require('./model');

class TabBar extends EventEmitter {

    constructor($container, model) {
        super();
        window._d.tabs = this;

        this.model = model
        this.$container = $container
        this.tabMap = {}
        this.tabIds = [];
        this.activeTabId = null

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

    addTab(tab, index){
        if(index > this.tabIds.length){
            index = this.tabIds.length
        }

        _
    }
}

class Tab extends EventEmitter{
    constructor(id, title) {
        this.id = id;
        this.title = title;

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
            text: title
        }).appendTo(this.$tab);
    }

    getId(){
        return this.id;
    }

    getTitle(){
        return this.title;
    }
}

module.exports = TabBar