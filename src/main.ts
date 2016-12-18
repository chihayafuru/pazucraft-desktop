import {BrowserWindow} from "electron";
import {app} from "electron";

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
        this.mainWindow = new BrowserWindow({width: 760, height: 630, resizable: false});
        this.mainWindow.loadURL(`file://${__dirname}/index.html`);

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
}

const mainApp = new MainApp(app);
