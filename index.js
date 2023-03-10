const fs = require('fs');
const puppeteer = require('puppeteer');
const _progress = require('cli-progress');
const _colors = require('ansi-colors');


/**
 * progressbar for UI
 * @type {SingleBar}
 */
const progressbar = new _progress.Bar({
    format: 'Scraping Pages |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} pages ',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
}, _progress.Presets.rect);

const PAGE_URL = 'https://cid.nena.org/index.php?&page=';
const col_length = 6;
const sql_stub = 'stub/mysql.sql';
const sql_output = 'NENACompanyParser.sql';
const log_flag = '-- log end flag'
const data_insert_query_start = "REPLACE INTO nena_companies(CoID,Company,Type,Status,`States Served`,`24X7 Phone`) VALUES (";
const data_insert_query_end = ");\n";
let scrapped_data, start = 1, end;

/**
 * chunking array by col_length for easy sql insert
 * @param inputArray
 * @param perChunk
 * @returns {*}
 */
function array_chunks(inputArray, perChunk) {

    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index/perChunk)

        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []
        }

        resultArray[chunkIndex].push(item)

        return resultArray
    }, []);
}

/**
 * add date and page indexing logs to sql file
 * @param data
 * @returns {*}
 */
function added_log(data){
    return data.replace(log_flag, '-- time: '+ new Date().toUTCString() + ' || startPage: '+start +' || endPage: '+end + "\n" + log_flag);
}

/**
 * if sql is created for first time
 * then get basic structure from stub
 */
function sql_update_from_stub(){

    if(!fs.existsSync(sql_output)){
        fs.copyFile(sql_stub, sql_output, (err) => {
            if (err) {
                console.log(err);
            }

        });
    }
}

/**
 * convert scrapped data into update query write to sql
 * also add log
 */
function sql_update_with_data(){

    fs.readFile(sql_output, 'utf8', function(err, data){

        fs.writeFile( sql_output, added_log(data), 'utf8', function(err) {
            if (err) {
                console.log(err);
            }
            else{
                scrapped_data.forEach(element => {
                    /**
                     * prevent existing log being written
                     */
                    if( !data.includes( data_insert_query_start + "\"" + element[0] + "\"" ) ){

                        fs.appendFile(sql_output,  data_insert_query_start + element.map(e => JSON.stringify(e)).join(",") + data_insert_query_end, (err) => {
                            if (err) {
                                console.log(err);
                            }

                        });
                    }

                });
            }
        });
    });
}

/**
 * base scraping logic
 * @param id
 * @returns {Promise<*>}
 */
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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    const response = await page.goto(PAGE_URL+id, {
        timeout: 60000,
        waitUntil: 'networkidle0'
    })

    let data;
    if(response.status() === 200){

        data = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('table tr td')).map(td => td.innerText);

        });

        /**
         * end flag selector
         */
        if( end === undefined){
            if(start !== 1 && process.argv[3] === "-"){
                end = start;
            }
            else{
                /**
                 * scrap end page number from PAGE_URL
                 * @type {number}
                 */
                end = await page.$eval('li[class*="details"]', el => parseInt(el.innerText.trim().split(" ").pop()));

                if(Number.isInteger(parseInt(process.argv[3]))){
                    end = parseInt(process.argv[3]);
                }

            }

            progressbar.start(end-start+1, 0);

        }


        data = array_chunks(data,col_length);

    }


    await page.close();
    await browser.close();

    return data;
}

/**
 * pagination start selector from arguments
 * @returns {Promise<void>}
 */
async function prepareArguments(){
    if(Number.isInteger(parseInt(process.argv[2]))){
        start = parseInt(process.argv[2]);

    }
}

/**
 * arguments controlled scrap runner
 * @returns {Promise<void>}
 */
async function main(){


    await prepareArguments().then(async function(){

        await scrap(start).then(async function (result) {
            scrapped_data = result;
            if(start === 1){
                scrapped_data.shift();
            }

            progressbar.increment(1);

            for (let i = start+1; i <= end; i++) {
                await scrap(i).then(function (result2) {
                    scrapped_data = scrapped_data.concat(result2);
                    progressbar.update(i-start+1);
                });
            }

        });

    });

}

/**
 * main executor
 */
main().then(function (){

    progressbar.stop();

    sql_update_from_stub();

    sql_update_with_data();

});