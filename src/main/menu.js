const { app, Menu } = require('electron')
const { BrowserWindow, ipcMain } = require('electron')

const template = require('./menu-template')

console.log(template)

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)