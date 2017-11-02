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
        this._tabMap = {}
        this._tabIds = [];
        this._activeTabId = null

        model.on(Model.EVENTS.openNote, (note) => {
            this.appendTab(new Tab(note.uri.toString(), note.name));
        });

        model.on(Model.EVENTS.activeNote, (note) => {
            this.activeTab(note.uri.toString());
        });

        model.on(Model.EVENTS.closeNote, (note, nextNote) => {
            // this.closeTab(note.uri.toString(), nextNote.uri.toString());
        });
    }

    appendTab(tab) {
        let newTabId = tab.getId();

        if (this._tabMap[newTabId]) {
            return this.activeTab(newTabId);
        }

        this._$container.append(tab.getElement());
        this._bindTabEvent(tab);

        this._tabMap[newTabId] = tab;
        this._tabIds.push(newTabId);

        this.activeTab(newTabId);
        return this._tabIds.length - 1;
    }

    _bindTabEvent(tab){
        tab.on(Tab.EVENTS.click, (targetTab)=>{
            this._model.activeNote(Note.create(targetTab.getId()));
        });
        tab.on(Tab.EVENTS.close, (targetTab)=>{
            this._model.closeNote(Note.create(targetTab.getId()));
        });
    }

    activeTab(id){
        if(this._activeTabId === id) return;
        if(!this._tabMap[id]) throw new Error(`activeTab fail. ${id} is not in tab-bar`);

        let prevId = this._activeTabId;
        this._activeTabId = id;

        if(prevId){
            this._tabMap[prevId].setActive(false);
        }
        this._tabMap[id].setActive(true);
    }

    closeTab(id){
        if(!this._tabMap[id]) throw new Error(`closeTab fail. ${id} is not in tab-bar`);

        
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

    getElement() {
        return this._$tab;
    }

    getId() {
        return this._id;
    }

    getTitle() {
        return this._title;
    }

    isActive(){
        return this._isActive;
    }

    isDirty() {
        return this._isDirty;
    }

    setActive(active){
        this._isActive = !!active;
        if(this._isActive){
            this._$tab.addClass("active");
        }else{
            this._$tab.removeClass("active");
        }
    }

    setDirty(dirty) {
        this._isDirty = !!dirty;
        if (this._isDirty) {
            this._$dirtyMark.css("display", "normal")
        } else {
            this._$dirtyMark.css("display", "none")
        }
    }
}

Tab.EVENTS = {
    click: "click",
    close: "close"
}

module.exports = {TabBar,Tab}