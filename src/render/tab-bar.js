const _ = require("lodash")
const p = require("path")
const EventEmitter = require('eventemitter3')
const Model = require('./model');
const Note = require("./editor/note");

class TabBar extends EventEmitter {

    constructor($container, model) {
        super();
        window._d.tabs = this;

        this._model = model
        this._$container = $container
        this._tabMap = new Map();
        this._tabIdOrderArr = [];
        this._activeTabId = null

        model.on(Model.EVENTS.openNote, (target, note, index) => {
            let newTab = new Tab(note.uri.toString(), note.name);
            this.addTab(newTab, index);

            // note.on(Note.EVENTS.update, (targetNote, content) => {
            //     newTab.setDirty(targetNote.isDirty);
            // })
        });

        model.on(Model.EVENTS.activeNote, (target, note) => {
            this.activeTab(note.uri.toString());
        });

        model.on(Model.EVENTS.closeNote, (target, note) => {
            this.closeTab(note.uri.toString());
        });

        model.on(Model.EVENTS.noteEvent, (target, noteEvent, targetNote) => {
            if(noteEvent == Note.EVENTS.update || noteEvent == Note.EVENTS.save){
                if(this._tabMap.has(targetNote.uriString)){
                    this._tabMap.get(targetNote.uriString).setDirty(targetNote.isDirty);
                }
            }
        });
    }

    _getActiveTabIndex() {
        return this._tabIdOrderArr.indexOf(this._activeTabId)
    }

    appendTab(tab) {
        return this.addTab(tab, this._tabIdOrderArr.length);
    }

    addTab(tab, index) {
        if (this._tabMap.has(tab.id)) return;
        if (index < 0) index = 0;
        if (index > this._tabIdOrderArr.length) index = this._tabIdOrderArr.length;

        if (index == 0) {
            this._$container.prepend(tab.$element);
        } else if (index == this._tabIdOrderArr.length) {
            this._$container.append(tab.$element);
        } else {
            this._$container.find(`.tab-item:nth-child(${index + 1})`).before(tab.$element);
        }
        this._bindTabEvent(tab);

        this._tabMap.set(tab.id, tab);
        this._tabIdOrderArr.splice(index, 0, tab.id);

        return index;
    }

    _bindTabEvent(tab) {
        tab.on(Tab.EVENTS.click, (targetTab) => {
            this._model.activeNote(Note.create(targetTab.id));
        });
        tab.on(Tab.EVENTS.close, (targetTab) => {
            this._model.closeNote(Note.create(targetTab.id));
        });
    }

    activeTab(id) {
        if (this._activeTabId === id) return;
        if (!this._tabMap.has(id)) throw new Error(`activeTab fail. ${id} is not in tab-bar`);

        let prevId = this._activeTabId;
        this._activeTabId = id;

        if (prevId) {
            this._tabMap.get(prevId).setActive(false);
        }
        this._tabMap.get(id).setActive(true);
    }

    closeTab(id) {
        let targetTab = this._tabMap.get(id)
        if (!targetTab) throw new Error(`closeTab fail. ${id} is not in tab-bar`);

        targetTab.$element.remove();
        this._tabMap.delete(id);
        _.pull(this._tabIdOrderArr, id);
        if (id === this._activeTabId) this._activeTabId = null;
    }
}

class Tab extends EventEmitter {
    constructor(id, title) {
        super();
        let that = this;
        this._id = id;
        this._title = title;
        this._isActive = false;
        this._isDirty = false;

        this._$tab = $('<div>', {
            class: "tab-item",
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

        this._$dirtyMark = $("<span>", {
            text: "*",
            css: {
                display: "none"
            }
        }).appendTo($title);
    }

    get $element() {
        return this._$tab;
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }

    get isActive() {
        return this._isActive;
    }

    get isDirty() {
        return this._isDirty;
    }

    setActive(active) {
        this._isActive = !!active;
        if (this._isActive) {
            this._$tab.addClass("active");
        } else {
            this._$tab.removeClass("active");
        }
    }

    setDirty(dirty) {
        this._isDirty = !!dirty;
        if (this._isDirty) {
            this._$dirtyMark.css("display", "inline")
        } else {
            this._$dirtyMark.css("display", "none")
        }
    }
}

Tab.EVENTS = {
    click: "click",
    close: "close"
}

module.exports = { TabBar, Tab }