const { app, BrowserWindow, Menu } = require('electron')
const { dialog } = require('electron');
const os = require('os');

function createWindow () {

  let win = new BrowserWindow({
    width: 1500,
    minWidth:800,
    height: 800,
    minHeight:800,
    webPreferences: {
      nodeIntegration: true,
      devTools:true
    }
  })

  const template = [
    {
      role:"about"
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
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'copy' },
        { role: 'paste' },
        { role: 'cut' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)