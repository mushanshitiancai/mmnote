CodeMirror.defineExtension('mmSwapDocByNote', function (note, mode, getContent, newDocSwapCallback) {
    // console.log('mmSwapDocByNote ', note, mode, getContent, newDocSwapCallback);
    let cm = this;

    if (!cm.mmDocMap) {
        cm.mmDocMap = new Map();
    }

    if (cm.mmDocMap.has(note.uriString)) {
        if (cm.mmDocMap.get(note.uriString) !== cm.getDoc()) {
            cm.swapDoc(cm.mmDocMap.get(note.uriString));
        }
    } else {
        let newDoc = CodeMirror.Doc(getContent(), mode);
        newDoc.mmSetNote(note);
        cm.mmDocMap.set(note.uriString, newDoc);
        cm.swapDoc(newDoc);

        if (newDocSwapCallback) {
            newDocSwapCallback(cm, newDoc);
        }
    }
});

// 如何销毁一个doc？
CodeMirror.defineExtension('mmCloseDocByNote', function(note){
    let cm = this;

    if (cm.mmDocMap && cm.mmDocMap.has(note.uriString)) {
        cm.mmDocMap.delete(note.uriString);
    }
});