
const fs = require("fs")

class MinderEditor {
    constructor($container) {
        // this._isDebug = true
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
        console.log('_createKityMinder');
        let km = new kityminder.Minder({
            enableKeyReceiver: false,
            enableAnimation: true
        });
        km._fuck = Math.random()

        if (!_d.kms) _d.kms = [];
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

            // km.renderTo(this._$minder.get(0));
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
        setInterval(() => {
            console.log('_isShow = ' + this._isShow);
        }, 1000);

        this.km = km;
        this.minder = minder;

        this.$div = $('<div>', {
            class: 'receiver',
            contenteditable: true,
            tabindex: -1
        });

        if (this.minder._isDebug) {
            this.$div.addClass('debug')
        }

        $container.append(this.$div);

        // this.$div.blur((e) => {
        //     // e.preventDefault();
        //     this.hide()
        //     // this.submitText()
        //     console.log("receiver onBlur")
        // });

        this.$div.keydown((e) => {
            if (!this._isShow) {
                // 如果有选中节点，并按下按键，则显示输入框，进行输入
                if (this.km.getSelectedNode() && this._isIntendToInput(e)) {
                    console.log('want to input');
                    this.show()
                } else {
                    // 否则清理刚刚的输入，并把按键作为快捷键处理
                    console.log('want to shortcut');
                    this.$div.html('');
                    this.km.dispatchKeyEvent(e);
                }
            } else {
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
        });
        this.$div.keypress((e) => {

        });
        this.$div.keyup((e) => {

        });

        // 如果在输入框显示的时候移动思维导图，输入框也需要跟着移动
        km.on('viewchange', (e) => {
            if (this._isShow) {
                this.updatePosition();
            }
        });

        km.on('beforemousedown', (e) => {
            console.log("km on beforemousedown", e);

            this.submitText()
        });

        this._selectAll();
    }

    _selectAll() {
        // 保证有被选中的
        if (!this.$div.innerHTML) this.$div.innerHTML = '&nbsp;';
        var range = document.createRange();
        var selection = window.getSelection();
        range.selectNodeContents(this.$div.get(0));
        selection.removeAllRanges();
        selection.addRange(range);
        this.$div.focus();
    }

    // Nice: http://unixpapa.com/js/key.html
    _isIntendToInput(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return false;

        // a-zA-Z
        if (e.keyCode >= 65 && e.keyCode <= 90) return true;

        // 0-9 以及其上面的符号
        if (e.keyCode >= 48 && e.keyCode <= 57) return true;

        // 小键盘区域 (除回车外)
        if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

        // 小键盘区域 (除回车外)
        // @yinheli from pull request
        if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

        // 输入法
        if (e.keyCode == 229 || e.keyCode === 0) return true;

        return false;
    }

    show() {
        let node = this.km.getSelectedNode()
        if (node) {
            this.updatePosition();

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
        this.$div.removeClass('input')
        this._selectAll()
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

        this._selectAll()
    }

    submitText() {
        if (!this._isShow) return;
        console.log('submitText');

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