const cheerio = require('cheerio');
const fs = require('fs');
let req = require('request');




req('https://www.uqwimax.jp/plan/', function (err, response, body) {
    if (err) {
        console.log('error');
    } else {
        const $ = cheerio.load(body);

        const provider = getProvider();
        const tag = getTag();
        let plans = getPlans($);
        // console.log('plans: ' + plans)
        let names = getNames($);
        // console.log('names: ' + names)
        let prices = getPrices($);
        // console.log('prices: ' + prices)
        let datas = getDatas($);
        // console.log('datas: ' + datas)

        let planNamesDatasPrices = getFusion(names, prices, datas);
        // console.log(planNamesDatasPrices)

        let dataToWrite = youWin(provider, tag, plans, planNamesDatasPrices);

        writeData(dataToWrite);
    }
})

function getProvider() {
    return "UQモバイル";
}

function getTag() {
    return "uq_mobile";
}

function getPlans($) {
    let plan = $('.head h2.title')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    return cleanData(plan);
}

function getNames($) {
    let name = $('table.table-product-price tbody tr:first-child td')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    return cleanData(name);
}

function getPrices($) {
    let price = $('table.table-product-price tbody tr:nth-child(2) td:not(:first-child)')
        .toArray()
        .map(function (node) {
            let reg = /\d{3}円|\d+\,\d+円/g
            let dataAasString = $(node).text();
            let parts = reg.exec(dataAasString);
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean);
    return cleanData(price)
}

function getDatas($) {
    let data = $('table.table-product-price tbody tr:last-child td:not(:first-child)')
        .toArray()
        .map(function (node) {
            let reg = /\d+GB/g
            let dataAsString = $(node).text()
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0];
        })
        .filter(Boolean);
    return cleanData(data)
}

function getFusion(names, prices, datas) {
    let plan = []

    for (let i = 0; i < names.length; i++) {
        plan.push({
            name: (names[i]) && (datas[i] || 'n/a'),
            price: prices[i]
        });
    }
    return plan
}

function youWin(provider, tag, plans, planNamesDatasPrices) {
    let data = [];
    let plan1 = planNamesDatasPrices.splice(6);
    let plan2 = planNamesDatasPrices;

    console.log(plans)

    let categories = [];
    categories.push({
        name: plans[0],
        plan: plan1
    });
    categories.push({
        name: plans[1],
        plan: plan2
    });

    console.log("plan1: " + plan1[1].name)

    plan1[0].name = "3GB";
    plan1[1].name = "3GB";
    plan1[2].name = "月間データ容量無制限（送受信最大500kbps)";
    plan1[3].name = "月間データ容量無制限（送受信最大500kbps)";

    console.log('fusion: ' + JSON.stringify(categories, null, 2))

    // console.log('plan1: ' + JSON.stringify(categories, null, 2))

    return {
        provider: provider,
        tag: tag,
        categories
    }

}

function cleanData(data) {
    let dataAasString = JSON.stringify(data);
    dataAasString = dataAasString.replace(/\s*\\n\s*/g, '');
    let cleanObj = JSON.parse(dataAasString);
    return cleanObj;
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("uq.json", dataAsString, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    });
}