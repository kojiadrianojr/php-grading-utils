require('events').EventEmitter.defaultMaxListeners = 0
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path')

const config = {
    path: process.env.OUTPUT_DIR,
}


//deleting archives
const clearArchives = ({path}) => {
    fs.readdir(`${path}`, (err, files) => {
        let archives = files.filter(ar => /\.zip$/.test(ar)).forEach(ar => {
            fs.unlink(`${path}/${ar}`, err => {
                if (err) throw err;
                console.log(`${ar} was deleted`);
            });
        });
    });
}


const readdir = async() => {
    const dirs = await fs.readdirSync(config.path)
    return dirs.filter(x => !/\.zip$/.test(x)) 
}


(async () => {
    await clearArchives(config);
    let directories = (await readdir() )  
    await directories.forEach(async dir => {
        if (!dir) throw (err)
        const browser =  await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`${path.join(config.path,dir,'index.html')}`);
        await page.screenshot({path: `screenshots/${dir}.png`, fullPage: true});
        await browser.close();
    })
})().catch(err => console.log(err));


