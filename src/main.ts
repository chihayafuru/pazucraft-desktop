const electron = require('electron');
const BrowserWindow: typeof Electron.BrowserWindow = electron.BrowserWindow;
var app: Electron.App = electron.app;

class MainApp {
    mainWindow: Electron.BrowserWindow = null;

    constructor(public app: Electron.App){
        this.app.on('window-all-closed', this.onWindowAllClosed);
        this.app.on('ready', this.onReady);
    }

    onWindowAllClosed(){
        app.quit();
    }

    onReady(){
        this.mainWindow = new BrowserWindow({width: 760, height: 580, resizable: false});

        this.mainWindow.loadURL(`file://${__dirname}/index.html`);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
}

const mainApp = new MainApp(app);
