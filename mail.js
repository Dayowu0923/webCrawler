const nodemailer = require('nodemailer');
const appSettings = require('./appsettings');
const dataFun = require('./dataHandler');

function sendEmail(filteredData) {
    let temp = "";
    let indexCount =  0 
    for(let i = 0 ; i< filteredData.length - 1 ; i++) {
        
        if(dataFun.addItem(filteredData[i].num) ||  filteredData[i].Top ==1)
        {
            indexCount  ++ ;
            temp += `
            <tr >
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ indexCount }</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].unit}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].city}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].num}<br><a href='https://web.pcc.gov.tw/${filteredData[i].link}' target='_blank'>${ filteredData[i].name}</a></td>
                <td style='padding:8px;text-align:center;vertical-align:middle'><a href='https://web.pcc.gov.tw/${filteredData[i].link}' target='_blank'>${ filteredData[i].count}</a></td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].type}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].type2}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].pdate}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].edate}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].amount}</td>
                <td style='padding:8px;text-align:center;vertical-align:middle'>${ filteredData[i].sTypeNum} - ${ filteredData[i].sType} </td>
            </tr>
            `;       
        }
    }

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: appSettings.mailuser, 
            pass: appSettings.mailpass 
        }
    });

    const mailOptions = {
        from: appSettings.mailuser, 
        to: appSettings.mailto, 
        subject: '<鑫捷>每日政府軟體標案-查尋回報', 
        html: `
            <h2>在什麼樣的網站裡面爬呀爬呀爬</h2><br><br>
            <h2>Hi~ 各位長官好</h2>
            <h4>以下是今天查詢的標案狀態。<br><br>
            * <font style='color:red'>按下</font> 標案案名
            (<font style='color:blue;text-decoration: underline'>下底線的字</font>) ，<br><br>
            瀏覽器直接導向該招標專案資訊網頁。</h4><br><br>

            <table  style="width: 150%; " border='2'>
            <thead>
                <tr>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>項次</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>機關名稱</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>縣市</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>標案案號/案名</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>傳輸次數</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>招標方式</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>採購性質</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>公告日期</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>截止投標</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>預算金額</th>
                    <th style='padding:8px;text-align:center;background-color:#FFE699;vertical-align:middle'>標的分類</th>
                </tr>
            </thead>
            <tbody>
                ${temp}
            </tbody>
            </table>
        `
    };
    if(indexCount > 0)
    {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error('Error occurred:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }
}
module.exports = sendEmail;