const puppeteer = require('puppeteer');
const axios = require('axios');
const appSettings = require('./appsettings');
const mail = require('./mail');
const getDay = require('./getDay');


const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const formattedDate = `${year}/${month}/${day}`;

const nearestFriday = getDay();
const nearYear = nearestFriday.getFullYear();
const nearMonth = nearestFriday.getMonth() + 1;
const nearDay = nearestFriday.getDate();
const nearFormattedDate = `${nearYear}/${nearMonth.toString().padStart(2, '0')}/${nearDay.toString().padStart(2, '0')}`;




const allData = [];
const allDetail = [];
(async () => {
  try {

    const browser = await puppeteer.launch({ headless: true  });

    const page = await browser.newPage();
    // 台灣的用戶代理
    const taiwanUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 TW";
  
    // 設置用戶代理
    await page.setUserAgent(taiwanUserAgent);
    
    
    for (const keyword of appSettings.keywords) {
       
        const keywordTitle = keyword.title; 
        const keywordNum = keyword.num; 

        const newLink = keyword.link + "&tenderStartDate=" + nearFormattedDate +"&tenderEndDate=" + formattedDate   
        // 前往目標網頁 政府採購網
        await page.goto(newLink);
        await page.waitForSelector('body');
        const tableData = await page.evaluate((keywordTitle, keywordNum) => {
           
            const element = document.querySelector('#pagebanner');
            const text = element.textContent.trim().replace(/,/g, '');
            const matchesNum = text.match(/\d+/);
            let resultCount = matchesNum ? matchesNum[0] : 0
           
            if(resultCount != 0)
            {
                console.log("1")
                const data = [];
                const rows = document.querySelectorAll('table.tb_01 tbody tr');
                rows.forEach(row => {
                    const rowData = {};
                    const columns = row.querySelectorAll('td');
                    // 提取項次，移除符號和空格
                    const sel1 = columns[0].textContent.trim();
                    const clean1 = sel1.match(/^(\d+)/);
                 
                    rowData['no'] = clean1 ? clean1[1].trim() : '';
                    rowData['unit'] = columns[1].textContent.trim();
                    // 提取標案案號，移除換行符號和空格
                    const Raw = columns[2].textContent.trim();
                    
                    const rMatch = Raw.match(/^([\w\d-]+)(?:\s+\(.+\))?/);
                    rowData['num'] = rMatch ? rMatch[1].trim() : '';
                    const nameF = columns[2].querySelector('span[id]');

                    rowData['Top'] = columns[2].textContent.trim().indexOf("更正公告") >= 0 ? 1:0 ;
                    
                    rowData['name'] = nameF ? nameF.textContent.trim() : '';
                    rowData['count'] = columns[3].textContent.trim();
                    rowData['type'] = columns[4].textContent.trim();
                    rowData['type2'] = columns[5].textContent.trim();
                    rowData['pdate'] = columns[6].textContent.trim();
                    rowData['edate'] = columns[7].textContent.trim();
                    rowData['amount'] = columns[8].querySelector('span').textContent.trim();
                    rowData['amountNew'] = columns[8].querySelector('span').textContent.trim().replace(/,/g, '');
                    const linkElem = row.querySelector('td:last-child a');
                    rowData['link'] = linkElem ? linkElem.getAttribute('href') : '';
                    rowData['sType'] = keywordTitle
                    rowData['sTypeNum'] = keywordNum
                    rowData['city'] = ""
                    data.push(rowData);
                });
                return data;
            }
           
        },keywordTitle, keywordNum);
        if(tableData != undefined)
            allData.push(...tableData); 
    }
    console.log(allData)
    
    let filteredData = allData.filter(item => 
        (
            item.amountNew >= 800000 
            && item.amountNew <= 7000000
            && item.name.indexOf(appSettings.keywordsNot) === -1
            && item.name.indexOf("資安") === -1
            && item.name.indexOf("資訊安全") === -1
            &&
            (
                ((item.sTypeNum == 849  || item.sTypeNum == 845) && item.name.indexOf("系統") >= 0 )
                ||
                (item.sTypeNum != 849 && item.sTypeNum != 845 )
            )
        ) 
        
        || item.unit.indexOf("農糧署") >= 0 
        || item.unit.indexOf("財團法人農業科技研究院") >= 0 
        || item.unit.indexOf("農業") >= 0 

        || item.name.indexOf("農糧署") >= 0 
        || item.name.indexOf("財團法人農業科技研究院") >= 0 
        || item.name.indexOf("農業") >= 0 
       
    );
    await page.goto('https://www.twbuygo.com/login');
    await page.waitForSelector('body');
    await page.type('#inputUsername', '0911264982');
    const divElement = await page.$('.input-group');
    const link = await divElement.$('a');
    await link.click();
    await page.type('input.form-control[type="text"]', 'Dayo0923');
    await page.click('button#login');
    await page.waitForNavigation();
    const previousTarget = await page.target();
    for(let i = 0 ; i<= filteredData.length - 1 ; i++)
    {
        await page.goto('https://www.twbuygo.com/search/index');
        await page.waitForSelector('body');
        await page.type('#inputSearch', filteredData[i].name);
        await page.click('button.btn.btn-primary[ng-click="searchResult()"]');
        await new Promise(resolve => setTimeout(resolve, 400)); 
        await page.waitForSelector('span.text-primary.float-right.ng-binding');
        const resultCount = await page.evaluate(() => {
            const element = document.querySelector('span.text-primary.float-right.ng-binding');
            const text = element.textContent.trim().replace(/,/g, '');
            const matches = text.match(/\d+/);
            return matches ? matches[0] : '0';
        });
       
        if(parseInt(resultCount) > 0)
        {
            const jiayiInfo = await page.evaluate(() => {
                const jiayiElement = document.querySelector('.search-list-1 .col-1');
                return jiayiElement.textContent.trim();
              });
              filteredData[i].city = jiayiInfo
            

        }

    }
    filteredData = filteredData.filter(item=>
        (
            item.city !== "宜蘭"  && 
            item.city !== "花蓮"  &&
            item.city !== "台東"   
        )
    )
   
    mail(filteredData);
    await browser.close();

  } catch (error) {
    console.error('Error:', error);
  }
})();