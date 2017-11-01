const _ = require("lodash")
const p = require("path")
const EventEmitter = require('eventemitter3')
const Model = require('./model');

class TabBar extends EventEmitter {

    constructor($container, model) {
        super();
        window._d.tabs = this;

        this._model = model
        this._$container = $container
        this._tabMap = {}
        this._tabIds = [];
        this._activeTabId = null

        model.on(Model.EVENTS.openNote, (note) => {
            this.appendTab(new Tab(note.uri.toString(), note.name));
        });

        model.on(Model.EVENTS.activeNote, (note) => {
            this.activeTabById(note.uri.toString());
        });

        model.on(Model.EVENTS.closeNote, (note, nextNote) => {
            this.closeTab(note.uri.toString(), nextNote.uri.toString());
        });
    }

    appendTab(tab) {
        let newTabId = tab.getId();

        if (this._tabMap[newTabId]) {
            return this.activeTab(newTabId);
        }

        this._$container.append(tab.getElement());

        this._tabMap[newTabId] = tab;
        this._tabIds.push(newTabId);

        this.activeTab(newTabId);
        return this._tabIds.length - 1;
    }

    activeTab(id){
        
    }
}

class Tab extends EventEmitter {
    constructor(id, title) {
        that = this;
        this._id = id;
        this._title = title;
        this._isDirty = false;

        this._$tab = $('<div>', {
            class: "tab",
            click: function () {
                that.emit(Tab.EVENTS.click, that);
            }
        });

        let $close = $('<span>', {
            class: "icon icon-cancel icon-close-tab",
            click: function () {
                that.emit(Tab.EVENTS.close, that);
            }
        }).appendTo(this._$tab);

        let $title = $("<span>", {
            class: "title",
            text: title
        }).appendTo(this._$tab);

        this.$dirtyMark = $("<span>", {
            text: "*",
            css: {
                display: "none"
            }
        }).appendTo($title);
    }

    getElement() {
        return this._$tab;
    }

    getId() {
        return this._id;
    }

    getTitle() {
        return this._title;
    }

    isDirty() {
        return this._isDirty;
    }

    setDirty(isDirty) {
        this._isDirty = !!isDirty;
        if (this._isDirty) {
            this.$dirtyMark.css("display", "normal")
        } else {
            this.$dirtyMark.css("display", "none")
        }
    }
}

Tab.EVENTS = {
    click: "click",
    close: "close"
}

module.exports = TabBar