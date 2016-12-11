import {remote} from "electron";
import * as path from "path";

class StartUp {

    private browserWindow = remote.getCurrentWindow();
    private modalWindow : Electron.BrowserWindow = null;

    private buttonLoad : HTMLButtonElement;
    private buttonConvert : HTMLButtonElement;
    private buttonSave : HTMLButtonElement;

    private menuLoad : Electron.MenuItem;
    private menuConvert : Electron.MenuItem;
    private menuSave : Electron.MenuItem;
    private menuDevDebug : Electron.MenuItem;

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
                        remote.app.quit();
                    }
                }
            ]
        }
    ];
    
    constructor() {
        this.initMenu();
        this.initButton();
    }

    private initMenu() {
        let menu = remote.Menu.buildFromTemplate(this.template);
        remote.Menu.setApplicationMenu(menu);

        if (menu.items[0].type == "submenu") {
            let subMenu : Electron.Menu = <Electron.Menu>menu.items[0].submenu;
            this.menuLoad = subMenu.items[0];
            this.menuConvert = subMenu.items[1];
            this.menuSave = subMenu.items[2];
            this.menuDevDebug = subMenu.items[3];

            this.menuLoad.enabled = true;
            this.menuConvert.enabled = false;
            this.menuSave.enabled = false;

            //this.menuDevDebug.visible = false;

            console.log(this.menuConvert.label);
        }
    }

    private initButton() {
        this.buttonLoad = <HTMLButtonElement>document.getElementById("button_load");
        this.buttonConvert = <HTMLButtonElement>document.getElementById("button_convert");
        this.buttonSave = <HTMLButtonElement>document.getElementById("button_save");

        this.buttonLoad.disabled = false;
        this.buttonConvert.disabled = true;
        this.buttonSave.disabled = true;
    }

    private openFile() {
        console.log("openFile()");
    }

    private convertImage() {
        console.log("convertImage()");

        const modalPath = path.join('file://', __dirname, 'modal.html');
        this.modalWindow = new remote.BrowserWindow({parent: this.browserWindow, frame: false, modal: true, transparent: true, resizable:false, alwaysOnTop: true});
        this.modalWindow.loadURL(modalPath);
        this.modalWindow.show();
    }

    private saveFile() {
        console.log("saveFile()");
    }
}

const startUp = new StartUp()