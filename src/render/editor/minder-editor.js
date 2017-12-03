
const fs = require("fs")

class MinderEditor {
    constructor($container) {
        this._isDebug = true
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
        let km = new kityminder.Minder({
            enableKeyReceiver: false,
            enableAnimation: true
        });

        if(!_d.kms) _d.kms = [];
        _d.kms.push(km)

        km.renderTo(this._$minder.get(0));
        km._note = note;
        let receiver = km._receiver = new Receiver(this.$container, km, this);

        km.on('dblclick', () => {
            if (km.getSelectedNode() && km._status !== 'readonly') {
                receiver.editText();
            }
        });

        km.on('contentchange', (evnet) => {
            km._note.update(JSON.stringify(km.exportJson()));
        });
        this._$minder.focus();

        this._$minder.on('keydown', (e) => {
            console(e);
        });

        this._$minder.on('keypress', (e) => {
            console(e);
        });

        this._$minder.on('keyup', (e) => {
            console(e);
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
        if (this._openKityMinderMap.has(note.uriString)) {
            this._active(note);
        } else {
            let km = this._createKityMinder(note);
            this._openKityMinderMap.set(note.uriString, km);
        }
    }

    _active(note) {
        if (this._openKityMinderMap.has(note.uriString)) {
            let km = this._openKityMinderMap.get(note.uriString)
            if (this._activeKityMinder == km) return;

            km.renderTo(this._$minder.get(0));
            this._activeKityMinder = km;
        }
    }

    close(note) {
        if (this._openKityMinderMap.has(note.uriString)) {
            let km = this._openKityMinderMap.get(note.uriString)
            if (this._activeKityMinder == km) {
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

        this.$div = $('<div>', {
            class: 'receiver',
            contenteditable: true
        });

        if (this.minder._isDebug) {
            this.$div.addClass('debug')
        }

        $container.append(this.$div);

        // this.$div.blur(() => {
        //     // this.submitText()
        //     console.log("receiver onBlur")
        // });

        this.$div.keydown(this.dispatchKey.bind(this));
        this.$div.keypress(this.dispatchKey.bind(this));
        this.$div.keyup(this.dispatchKey.bind(this));

        // 如果在输入框显示的时候移动思维导图，输入框也需要跟着移动
        km.on('viewchange', (e) => {
            if (this._isShow) {
                this.updatePosition();
            }
        });
    }

    dispatchKey(e) {
        console.log(this._isShow,e);
        if (!this._isShow) {
            // e.preventDefault();
            this.km.dispatchKeyEvent(e);
        } else {
            if (e.type == "keypress") {
                switch (e.which) {
                    case 13:/*enter*/
                        e.preventDefault()
                        this.submitText()
                        break;
                    case 27:/*esc*/
                        e.preventDefault()
                        this.hide()
                        break;
                }
            }
        }
    }

    show() {
        let node = this.km.getSelectedNode()
        if (node) {
            let fontSize = node.getData('font-size') || node.getStyle('font-size');
            this.$div.css('font-size', fontSize + 'px');
            this.$div.css('min-width', '0px');
            this.$div.css('font-weight', node.getData('font-weight') || '');
            this.$div.css('font-style', node.getData('font-style') || '');
            this.$div.addClass('input')
            this.$div.focus()
            this._isShow = true
        }
    }

    isShow() {
        return this._isShow
    }

    hide() {
        this._isShow = false
        // this.$div.removeClass('input')

        // this.$div.blur();
        //window.getSelection().removeAllRanges();
        // this.km.focus()
    }

    updatePosition() {
        let focusNode = this.km.getSelectedNode()
        if (!focusNode) return;

        var box = focusNode.getRenderBox('TextRenderer');
        this.$div.css("left", Math.round(box.x) + 'px');
        this.$div.css("top", (this.minder._isDebug ? Math.round(box.bottom + 30) : Math.round(box.y)) + 'px');
    }

    editText() {
        let node = this.km.getSelectedNode()
        if (!node) return;

        this.updatePosition();
        this.show();

        let $textContainer = this.$div;

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

        // $textContainer.selectAll()
    }

    submitText() {
        if (!this._isShow) return;

        let node = this.km.getSelectedNode()
        if (!node) return;

        this.hide()
        node.setText(this.$div.text())
        this.km.fire("contentchange");
        this.km.getRoot().renderTree();
        this.km.layout(300);
    }
}

module.exports = MinderEditor