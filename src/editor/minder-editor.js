
const fs = require("fs")

class MinderEditor {
    constructor($container) {
        this._isDebug = false

        this.$container = $container;
        this.$minder = $('<div>', {
            id: "minder"
        });
        this.$container.append(this.$minder);

        this.km = km = window.km = new kityminder.Minder();
        km.renderTo(this.$minder.get(0));

        this.receiver = new Receiver(this.$container, this.km, this);

        km.on('dblclick', () => {
            if (km.getSelectedNode() && km._status !== 'readonly') {
                this.receiver.editText();
            }
        });
    }

    open(note){
        let content = fs.readFileSync(note.uri.fsPath,'utf-8')
        this.km.importJson(JSON.parse(content))
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
        if(!this._isShow) return;

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