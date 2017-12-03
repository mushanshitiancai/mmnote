const { keyCodeMap, codeKeyMap } = require('./key-code');

class ShortcutKey {
    constructor(ctrlKey, altKey, metaKey, shiftKey, keyCode) {
        this.ctrlKey = !!ctrlKey;
        this.altKey = !!altKey;
        this.metaKey = !!metaKey;
        this.shiftKey = !!shiftKey;
        this.keyCode = keyCode;
    }

    equals(another) {
        return this.ctrlKey == another.ctrlKey
            && this.altKey == another.altKey
            && this.metaKey == another.meta
            && this.shiftKey == another.shiftKey
            && this.keyCode == another.keyCode
    }

    toString() {
        let arr = []
        if (this.metaKey) arr.push('cmd');
        if (this.ctrlKey) arr.push('ctrl');
        if (this.altKey) arr.push('alt');
        if (this.shiftKey) arr.push('shift');
        arr.push(codeKeyMap[this.keyCode]);

        return arr.join('+')
    }

    static createFromEvent(e) {
        let ctrlKey = e.ctrlKey;
        let altKey = e.altKey;
        let metaKey = e.metaKey;
        let shiftKey = e.shiftKey;
        let keyCode = e.keyCode;

        return new ShortcutKey(ctrlKey, altKey, metaKey, shiftKey, keyCode);
    }

    static createFromString(str) {
        str = str.replace(/ /g, '');
        let bindingArr = str.split('+')

        let ctrlKey, altKey, metaKey, shiftKey, keyCode
        for (let key of bindingArr) {
            if (key.toLowerCase() == 'ctrl') {
                ctrlKey = true;
            } else if (key.toLowerCase() == 'alt') {
                altKey = true;
            } else if (key.toLowerCase() == 'cmd') {
                metaKey = true;
            } else if (key.toLowerCase() == 'shift') {
                shiftKey = true;
            }
        }

        str = str.replace(/\+|ctrl|alt|cmd|shift/g, '');
        keyCode = keyCodeMap[str]

        return new ShortcutKey(ctrlKey, altKey, metaKey, shiftKey, keyCode);
    }
}

class KeyBinding {
    constructor(shortcutKey, comamnd, when) {
        this.shortcutKey = shortcutKey;
        this.command = comamnd;
        this.when = when;
    }
}

class KeyBindingService {
    constructor(commandService) {
        this._commandService = commandService;
        this._keyBindingMap = new Map();
    }

    register(key, command, when) {
        let shortcurKey = ShortcutKey.createFromString(key);
        let keyBinding = new KeyBinding(shortcurKey, command, when);
        this._keyBindingMap.set(shortcurKey.toString(), keyBinding);
    }

    startListen() {
        window.addEventListener('keydown', (e) => {
            let shortcutKey = ShortcutKey.createFromEvent(e);
            if (this._keyBindingMap.has(shortcutKey.toString())) {
                let keyBinding = this._keyBindingMap.get(shortcutKey.toString());
                this._commandService.exec(keyBinding.command);

                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }
}

module.exports = { KeyBindingService, KeyBinding, ShortcutKey }