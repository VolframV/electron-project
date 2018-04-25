const electron = require('electron');
const url = require('url');
const path = require('path');
const express = require('express');
const mysql = require('mysql');

const appServer = express();

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;
// create connection
const db= mysql.createConnection({
    host        : '127.0.0.1',
    user        : 'root',
    password    : '',
    database    : 'vladuvja_emberalpha'
});
// connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL Connection...');
})

// server
appServer.listen('3000', () =>{
    console.log('Server Started on port 3000');
});




//////////////////////////////////////MAIN WINDOW///////////////////////////////////////////////

// Listen for app to be ready 
app.on('ready',function(){
    //create new window
    mainWindow = new BrowserWindow({});
    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
 
    // create database on click
    ipcMain.on('myBtn', function(){
        let sql = 'SELECT * FROM `itemlist`';

        db.query(sql, (err, result)=>{
            if(err) throw err;
            console.log(result);
    });
});

        //quit app when closed
        mainWindow.on('closed', function(){
            app.quit();
        });

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert menu
    Menu.setApplicationMenu(mainMenu);
    
});

/////////////////////////////////////////////////////////////////////////////////////////////////




//Handle create add window
function createAddWindow(){
//create new window
addWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: 'Add shoping list item'
});
// load html into window
addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol:'file:',
    slashes: true
})); 
    //Garbage collection handle
    addWindow.on('close',function(){
        addWindow = null;
    });
}

// catach item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

//create menu template 
const mainMenuTemplate = [
    
    {
        label: 'File',
        submenu:[
        {
            label: 'Add Item',
            click(){
                createAddWindow();
            }
        },
        {
            label: 'Clear Items',
            click(){
                mainWindow.webContents.send('item:clear');
            }
        },
        {
            label: 'Quit', 
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){
                app.quit();
            }
        }
        ]
    }

];
// create Database




// if mac do the mac menu fix
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// add developer tools item if not in production mode
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer tools',
        submenu:[
            {
               label: 'toggle DevToolks',
               accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
               click(item, focusedWindow){
                focusedWindow.toggleDevTools();
               }
            },
            {
                role: 'reload'
            }
        ]
    })
}
