import {remote} from "electron";
import {join} from "path";

const app = remote.app;
const BrowserWindow = remote.BrowserWindow;
const Menu = remote.Menu;

class StartUp {

    private browserWindow = remote.getCurrentWindow();
    private modalWindow : Electron.BrowserWindow = null;

    private template = [
        {
            label: 'File',
            submenu:[
                {
                    label: 'Open',
                    click: (item : Electron.MenuItem, focusedWindow : Electron.BrowserWindow) => {
                        this.openFile();
                    }
                },
                {
                    label: 'Convert',
                    click: (item : Electron.MenuItem, focusedWindow : Electron.BrowserWindow) => {
                        this.convertImage();
                    }
                },
                {
                    label: 'Save',
                    click: (item : Electron.MenuItem, focusedWindow : Electron.BrowserWindow) => {
                        this.saveFile();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    click: (item : Electron.MenuItem, focusedWindow : Electron.BrowserWindow) => {
                        this.browserWindow.webContents.toggleDevTools();
                    }
                },
                {
                    label: 'Quit',
                    click: (item : Electron.MenuItem, focusedWindow : Electron.BrowserWindow) => {
                        if (this.modalWindow) {
                            this.modalWindow.close();
                        }
                        app.quit();
                    }
                }
            ]
        }
    ];
    
    constructor() {
        let menu = Menu.buildFromTemplate(this.template);
        Menu.setApplicationMenu(menu);

        let para = document.getElementById("greeting");
        para.innerText = "Hello Electron App!";
    }

    private openFile() {
        console.log("openFile()");
    }

    private convertImage() {
        console.log("convertImage()");

        const modalPath = join('file://', __dirname, 'modal.html');
        this.modalWindow = new BrowserWindow({parent: this.browserWindow, frame: false, modal: true, transparent: true, resizable:false, alwaysOnTop: true});
        this.modalWindow.loadURL(modalPath);
        this.modalWindow.show();
    }

    private saveFile() {
        console.log("saveFile()");
    }
}

const startUp = new StartUp()