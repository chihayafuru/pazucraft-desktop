import {remote} from "electron";
import * as path from "path";
import Development from "./development";

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

    private development : Development;

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
                            if (!this.modalWindow.isDestroyed()) {
                                this.modalWindow.destroy();
                            }
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
        this.development = new Development();
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
        }
    }

    private initButton() {
        this.buttonLoad = <HTMLButtonElement>document.getElementById("button_load");
        this.buttonConvert = <HTMLButtonElement>document.getElementById("button_convert");
        this.buttonSave = <HTMLButtonElement>document.getElementById("button_save");

        this.buttonLoad.disabled = false;
        this.buttonConvert.disabled = true;
        this.buttonSave.disabled = true;

        this.buttonLoad.addEventListener('click', (e)=>{this.openFile();});
        this.buttonConvert.addEventListener('click', (e)=>{this.convertImage();});
        this.buttonSave.addEventListener('click', (e)=>{this.saveFile();});
    }

    private openFile() {
        const options : Electron.OpenDialogOptions= {
            title: 'Load Image',
            defaultPath: remote.app.getPath('pictures'),
            filters: [
                {name: 'Images', extensions: ['jpg']},
            ],
            properties: ['openFile']
        };

        remote.dialog.showOpenDialog(this.browserWindow, options, (fileNames) => {
            if (fileNames) {
                this.development.loadFile(fileNames[0],
                                    (e) => {
                                        this.buttonConvert.disabled = false;
                                        this.menuConvert.enabled = true;
                                        this.buttonSave.disabled = true;
                                        this.menuSave.enabled = false;
                                    },
                                    function(e) {
                                        console.log("fail to load file!!!");
                                    }
            );
            }
        });
    }

    private convertImage() {
        let drawLines : boolean;
        let lineStyle : string;
        let colorButtons = document.getElementsByName("line_color")

        for (var i = 0 ; i < colorButtons.length ; i++) {
            let btn = <HTMLInputElement>colorButtons[i]
            if (btn.checked) {
                switch (btn.id) {
                    case "line_white":
                        drawLines = true;
                        lineStyle = "rgba(255,255,255,128)"
                        console.log("white");
                        break;
                    case "line_black":
                        drawLines = true;
                        lineStyle = "rgba(0,0,0,128)"
                        console.log("black");
                        break;
                    case "line_aqua":
                        drawLines = true;
                        lineStyle = "rgba(0,255,255,128)"
                        console.log("aqua");
                        break;
                    case "line_none":
                    default:
                        drawLines = false;
                        lineStyle = "rgba(255,255,255,0)"
                        console.log("none");
                        break;
                }
            }
        }


        const modalPath = path.join('file://', __dirname, 'modal.html');
        this.modalWindow = new remote.BrowserWindow({parent: this.browserWindow, frame: false, modal: true, transparent: true, resizable:false, alwaysOnTop: true});
        this.modalWindow.loadURL(modalPath);
        this.modalWindow.show();
        const id = remote.powerSaveBlocker.start('prevent-app-suspension');
        this.development.drawLines = drawLines;
        this.development.lineStyle = lineStyle;
        this.development.convertImage( (e) => {
            this.buttonSave.disabled = false;
            this.menuSave.enabled = true;
            remote.powerSaveBlocker.stop(id);
            this.modalWindow.close();
            this.modalWindow = null;
        });
    }

    private saveFile() {
        var options = {
            title: 'Save Image',
            defaultPath: remote.app.getPath('pictures'),
            filters: [
                {name: 'Images', extensions: ['png']},
            ],
        }

        remote.dialog.showSaveDialog(options, (fileName) => {
            console.log(fileName);
            this.development.saveFile(fileName);
        });
    }
}

const startUp = new StartUp()