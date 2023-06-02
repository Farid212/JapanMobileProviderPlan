const cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('https://linksmate.jp/plan/', function (err, response, body) {
    if (err) {
        console.log('error');
    } else {
        const $ = cheerio.load(body);

        // console.log(body);
        const provider = "プラン・料金 | リンクスメイト -LinksMate-";
        const tag = "linksmate";
        let planName = getPlansName($);
        let dataSize = getDataInformation($);
        let priceDataSize = getPriceDataSizePlan($);
        let allPlans = getAllPlans(provider, tag, planName, dataSize, priceDataSize)
        console.log(allPlans);

        writeData(allPlans);
    }
})



function getAllPlans(provider, tag, planName, dataSize, priceDataSize) {
    // console.log(provider)
    // console.log(tag)
    // console.log(planName)
    // console.log(dataSize)
    // console.log(priceDataSize)

    let data = [];

    for (let i = 0; i < dataSize.length; i++) {
        data.push({
            name: dataSize[i],
            price: priceDataSize[i]
        });
    }

    // console.log("data var" + JSON.stringify(data, null, 2));

    let Plan1 = data.splice(0, Math.ceil(data.length / 2));
    let Plan2 = data;

    // console.log(Plan1)
    // console.log(Plan2)

    let categories = []

    categories.push({
        name: planName[0],
        plan: Plan1
    })
    categories.push({
        name: planName[0],
        plan: Plan2
    })

    return {
        provider: provider,
        tag: tag,
        categories
    }

}

function getPriceDataSizePlan($) {
    priceData = $('.table-box-price tbody tr:nth-child(2) td span strong')
        .toArray()
        .map(function (node) {
            return ($(node).text().replace(/,/g, ''))
        })
    return cleanData(priceData);
}

function getDataInformation($) {
    dataCapacity = $('.table-box-price tbody tr:first-child th')
        .toArray()
        .map(function (node) {
            return ($(node).text())
        })
    return cleanData(dataCapacity);
}


function getPlansName($) {
    let allPlansName = $('.price-title')
        .toArray()
        .map(function (node) {
            return ($(node).text())
        });
    //console.log(cleanData(allPlansName))
    return cleanData(allPlansName);
}

function cleanData(data) {
    let dataAsString = JSON.stringify(data);
    dataAsString = dataAsString.replace(/\s*\\n\s*/g, "");
    let cleanObj = JSON.parse(dataAsString);
    return cleanObj;
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("linkmate.json", dataAsString, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    });
}