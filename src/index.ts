import {remote} from "electron";
const app = remote.app;
const Menu = remote.Menu;

class StartUp {

    private browserWindow = remote.getCurrentWindow();

    private template = [
        {
            label: 'File',
            submenu:[
                {
                    label: 'Open',
                    click: (item, focusedWindow) => {
                        this.openFile();
                    }
                },
                {
                    label: 'Convert',
                    click: (item, focusedWindow) => {
                        this.convertImage();
                    }
                },
                {
                    label: 'Save',
                    click: (item, focusedWindow) => {
                        this.saveFile();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    click: (item, focusedWindow) => {
                        this.browserWindow.webContents.toggleDevTools();
                    }
                },
                {
                    label: 'Quit',
                    click: (item, focusedWindow) => {
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
    }

    private saveFile() {
        console.log("saveFile()");
    }
}

const startUp = new StartUp()