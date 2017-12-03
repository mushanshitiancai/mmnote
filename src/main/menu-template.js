const _ = require('lodash')
const { app, Menu } = require('electron')

// 扩展字段： 
// platform: 特定平台才显示
// command: 触发的命令
let template = [
    {
        label: app.getName(),
        platform: 'darwin',
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    },
    {
        label: '&Edit',
        submenu: [
            {
                label: '&Save',
                "accelerator": "CmdOrCtrl+S"
            },
            { type: 'separator' },
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' },
            {
                type: 'separator',
                platform: 'darwin'
            },
            {
                label: 'Speech',
                platform: 'darwin',
                submenu: [
                    { role: 'startspeaking' },
                    { role: 'stopspeaking' }
                ]
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        role: 'window',
        submenu: [
            { role: 'minimize' },
            { role: 'close' },
            {
                role: 'zoom',
                platform: 'darwin',
            },
            {
                type: 'separator',
                platform: 'darwin',
            },
            {
                role: 'front',
                platform: 'darwin',
            }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click() { require('electron').shell.openExternal('https://electron.atom.io') }
            }
        ]
    }
];

function parseTemplate(template) {
    parseMenu(template);

    return template;
}

function parseMenu(subMenus) {
    for (let i in subMenus) {
        let menu = subMenus[i];
        if (menu.platform && process.platform != menu.platform) {
            subMenus.splice(i, 1);
        }else{
            if(menu.submenu){
                parseMenu(menu.submenu)
            }
        }
    }
}

module.exports = parseTemplate(template);