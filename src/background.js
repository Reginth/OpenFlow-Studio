// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
const ipcMain = require('electron').ipcMain;
import { app, Menu } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
//const remote = require('remote')
//const MenuItem = remote.require('menu-item')
import createWindow from "./helpers/window";


// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    
  })
  .on('typeError', err => {

    console.error(err, 'Uncaught Exception thrown');
    
  });
const { BrowserWindow } = require('electron')

ipcMain.on('project', function(event){

    
  const modalPath = path.join('file://', __dirname, 'project.html')
   var win = new BrowserWindow({ width: 400, height: 400, resizable:false, backgroundColor:'#252525', show:false, title:"Project",webPreferences: {
    nodeIntegration: true
  }
 })
    win.on('close', function () { win = null })
    win.loadURL(modalPath)
  win.once('ready-to-show', () => {
    win.show()
  });
  
});

ipcMain.on('new_project', function(event){
  mainWindow.webContents.send('new_project');
})


const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};
// Importing this adds a right-click menu with 'Inspect Element' option

/*let rightClickPosition = null

const menu = new Menu()
const menuItem = new MenuItem({
  label: 'Inspect Element',
  click: () => {
    remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
  }
})
menu.append(menuItem)

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = {x: e.x, y: e.y}
  menu.popup(remote.getCurrentWindow())
}, false)
*/
// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}
var mainWindow = "";
app.on("ready", () => {
  setApplicationMenu();

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    minWidth: 700,
    minHeight: 350,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
    nodeIntegration: true
  }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }
});



export const editMenuTemplate = {
  label: "Edit",
  submenu: [
    { label: "Save", accelerator: "CmdOrCtrl+S", click: () => {
        mainWindow.webContents.send('savefile');
      } },
    { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
    { type: "separator" },
    { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]
};


app.on("window-all-closed", () => {
  app.quit();
});
