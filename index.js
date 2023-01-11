const fs = require('fs');
const puppeteer = require('puppeteer');
const _progress = require('cli-progress');
const _colors = require('ansi-colors');



const progressbar = new _progress.Bar({
    format: 'Scraping Pages |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} pages ',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
}, _progress.Presets.rect);

const PAGE_URL = 'https://cid.nena.org/index.php?&page=';
const col_length = 6;
const sql_stub = 'stub/mysql.sql';
const sql_output = 'scrapper.sql';
let scrapped_data,pagination_length;

function array_chunks(inputArray, perChunk) {

    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index/perChunk)

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)

        return resultArray
    }, [])
}

async function scrap(id) {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });

    const device_width = 1920;
    const device_height = 1080;



    const page = await browser.newPage();

    await page.setCacheEnabled(false);
    await page.setViewport({width: device_width, height: device_height})
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    const response = await page.goto(PAGE_URL+id, {
        timeout: 60000,
        waitUntil: 'networkidle0'
    })

    let data;
    if(response.status() === 200){

        data = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('table tr td')).map(td => td.innerText)

        });

        if(pagination_length === undefined){
            pagination_length = await page.$eval('li[class*="details"]', el => parseInt(el.innerText.trim().split(" ").pop()));
            progressbar.start(pagination_length, 0);
        }
        progressbar.start(pagination_length, 0);

        data = array_chunks(data,col_length)

    }


    await page.close();
    await browser.close();

    return data;
}



async function main(){
    await scrap(1).then(async function (result) {
        scrapped_data = result;
        scrapped_data.shift();
        progressbar.increment(1);

        for (let i = 2; i <= pagination_length; i++) {
             await scrap(i).then(function (result2) {
                scrapped_data = scrapped_data.concat(result2);
                progressbar.update(i);
            })
        }

    })

}


main().then(function (){
    progressbar.stop();

    fs.copyFile(sql_stub, sql_output, (err) => {
        if (err) {
            console.log(err);
        }

    });

    scrapped_data.forEach(element => {

        fs.appendFile(sql_output, "REPLACE INTO nena_companies(CoID,Company,Type,Status,`States Served`,`24X7 Phone`) VALUES (" + element.map(e => JSON.stringify(e)).join(",") +");\n", (err) => {
            if (err) {
                console.log(err);
            }

        });

    })

})