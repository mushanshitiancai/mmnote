CodeMirror.defineDocExtension('mmSetMetaInfo', function (key, value) {
    let doc = this

    if (!doc.mmMetaInfo) {
        doc.mmMetaInfo = {};
    }
    if (key === undefined || key === null) return;

    doc.mmMetaInfo[key] = value;
});

CodeMirror.defineDocExtension('mmGetMetaInfo', function (key) {
    let doc = this;

    if (!key) return doc.mmMetaInfo;

    return doc.mmMetaInfo ? doc.mmMetaInfo[key] : undefined;
});

CodeMirror.defineDocExtension('mmSetURL', function (url) {
    let doc = this;

    doc.mmSetMetaInfo('url', url);
});

CodeMirror.defineDocExtension('mmGetURL', function (url) {
    let doc = this;

    return doc.mmGetMetaInfo('url');
});

CodeMirror.defineExtension('mmSwapDocByUrl', function (url, mode, getContent, newDocSwapCallback) {
    console.log('mmSwapDocByUrl ',arguments);
    let cm = this;

    if (!cm.mmDocMap) {
        cm.mmDocMap = new Map();
    }

    if (cm.mmDocMap.has(url)) {
        if (cm.mmDocMap.get(url) !== cm.getDoc()) {
            cm.swapDoc(cm.mmDocMap.get(url));
        }
    } else {
        let newDoc = CodeMirror.Doc(getContent(), mode);
        newDoc.mmSetURL(url);
        cm.mmDocMap.set(url, newDoc);
        cm.swapDoc(newDoc);

        if (newDocSwapCallback) {
            newDocSwapCallback(cm, newDoc);
        }
    }
})