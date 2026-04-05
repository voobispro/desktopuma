const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 200,
    resizable: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createMainWindow);

// Listen for renderer asking to open file dialog
ipcMain.on("open-file-dialog", async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Media', extensions: ['png', 'gif', 'mp4'] }
    ]
  });

  if (!canceled && filePaths.length > 0) {
    ipcMain.emit("start-pet", null, filePaths[0]); // trigger pet spawn
  }
});

// Pet spawn
ipcMain.on("start-pet", (event, imagePath) => {
  const petWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  petWindow.loadFile("pet.html");

  petWindow.webContents.once("did-finish-load", () => {
    petWindow.webContents.send("set-image", imagePath);
  });
});