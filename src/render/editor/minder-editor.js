
const fs = require("fs")

class MinderEditor {
    constructor($container) {
        this._isDebug = false
        this.$container = $container;
        this._$minder = $('<div>', {
            id: "minder"
        }).appendTo($container);

        this.reset();
    }

    reset() {
        this._openKityMinderMap = new Map();
        this._activeKityMinder = null;
    }

    _getKityMinder(note) {
        if (this._openKityMinderMap.has(note.uriString)) {
            return this._openKityMinderMap.get(note.uriString);
        }
        return null;
    }

    _createKityMinder(note) {
        let km = new kityminder.Minder();
        km.renderTo(this._$minder.get(0));
        km._note = note;
        let receiver = km._receiver = new Receiver(this.$container, km, this);

        km.on('dblclick', () => {
            if (km.getSelectedNode() && km._status !== 'readonly') {
                receiver.editText();
            }
        });

        km.on('contentchange', (evnet)=>{
            km._note.update(JSON.stringify(km.exportJson()));
        });

        // this._codeMirror.on('change', (cm, changeObj) => {
        //     let doc = cm.getDoc();
        //     let note = doc._context.note;
        //     note.update(doc.getValue()); // getValue()是否低效？
        // })

        km.importJson(JSON.parse(note.readContent()))
        return km;
    }

    open(note) {
        if(this._openKityMinderMap.has(note.uriString)){
            this._active(note);
        }else{
            let km = this._createKityMinder(note);
            this._openKityMinderMap.set(note.uriString, km);
        }
    }

    _active(note){
        if(this._openKityMinderMap.has(note.uriString)){
            let km = this._openKityMinderMap.get(note.uriString)
            if(this._activeKityMinder == km) return;

            km.renderTo(this._$minder.get(0));
            this._activeKityMinder = km;
        }
    }

    close(note) {
        if(this._openKityMinderMap.has(note.uriString)){
            let km = this._openKityMinderMap.get(note.uriString)
            if(this._activeKityMinder == km){
                _activeKityMinder = null;
            }

            this._openKityMinderMap.delete(note.uriString)
        }
    }
}

class Receiver {
    constructor($container, km, minder) {
        this._isShow = false
        this.km = km;
        this.minder = minder;

        this.$element = $('<div>', {
            class: 'receiver',
            contenteditable: true
        });

        if (this.minder._isDebug) {
            this.$element.addClass('debug')
        }

        $container.append(this.$element);

        this.$element.blur(() => {
            this.submitText()
        })

        km.on('viewchange', (e) => {
            if (this._isShow) {
                this.updatePosition();
            }
        });
    }

    show() {
        let node = this.km.getSelectedNode()
        if (node) {
            let fontSize = node.getData('font-size') || node.getStyle('font-size');
            this.$element.css('font-size', fontSize + 'px');
            this.$element.css('min-width', '0px');
            // this.$element.css('min-width', this.$element.get(0).clientWidth + 'px');
            this.$element.css('font-weight', node.getData('font-weight') || '');
            this.$element.css('font-style', node.getData('font-style') || '');
            this.$element.addClass('input')
            this.$element.focus()
            this._isShow = true
        }
    }

    isShow() {
        return this._isShow
    }

    hide() {
        this._isShow = false
        this.$element.removeClass('input')
        this.km.focus()
    }

    updatePosition() {
        let focusNode = this.km.getSelectedNode()
        if (!focusNode) return;

        var box = focusNode.getRenderBox('TextRenderer');
        this.$element.css("left", Math.round(box.x) + 'px');
        this.$element.css("top", (this.minder._isDebug ? Math.round(box.bottom + 30) : Math.round(box.y)) + 'px');
    }

    editText() {
        let node = this.km.getSelectedNode()
        if (!node) return;

        this.updatePosition();
        this.show();

        let $textContainer = this.$element;

        // 如果有粗体或者斜体，输入容器要设置对应的风格
        if (node.getData('font-weight') === 'bold') {
            let $b = $('<b>')
            $textContainer.append($b)
            $textContainer = $b
        }
        if (node.getData('font-style') === 'italic') {
            let $i = $('<i>')
            $textContainer.append($i)
            $textContainer = $i
        }
        $textContainer.text(this.km.queryCommandValue('text'));
        $textContainer.keydown((e) => {
            console.log(e.type + ": " + e.which);
            switch (e.which) {
                case 13:/*enter*/
                    this.submitText()
                    break;
                case 27:/*esc*/
                    this.hide()
                    break;
            }
        })
        // $textContainer.selectAll()
    }

    submitText() {
        if (!this._isShow) return;

        let node = this.km.getSelectedNode()
        if (!node) return;

        this.hide()
        node.setText(this.$element.text())
        this.km.fire("contentchange");
        this.km.getRoot().renderTree();
        this.km.layout(300);
    }
}

module.exports = MinderEditor