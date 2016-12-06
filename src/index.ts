import {remote} from "electron";
const app = remote.app;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

class StartUp {

    private browserWindow = remote.getCurrentWindow();

    private template = [
        {
            label: 'File',
            submenu:[
                {
                    label: 'Open',
                    click: (item, focusedWindow) => {
                        console.log("open()");
                    }
                },
                {
                    label: 'Convert',
                    click: (item, focusedWindow) => {
                        console.log("convert()");
                    }
                },
                {
                    label: 'Save',
                    click: (item, focusedWindow) => {
                        console.log("save()");
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
}

const startUp = new StartUp()