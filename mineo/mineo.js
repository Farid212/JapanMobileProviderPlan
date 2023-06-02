let cheerio = require('cheerio');
let fs = require('fs');
let request = require('request');

request('http://mineo.jp/charge/', function (err, response, body) {
    if (err) {
        console.log('error')
    } else {
        const $ = cheerio.load(body);

        const provider = getProvider();
        let tags = getTag();
        let names = getNames($);
        let datas = getDatas($);
        let prices = getPrices($);
        let tagNameDataPrice = getFusion(provider, tags, names, datas, prices);
        writeData(tagNameDataPrice);
    }
})

function getProvider() {
    return "mineo";
}

function getTag() {
    return ["mineo_a", "mineo_d"];
}

function getNames($) {
    let name = $('.table_style.mb40.charge_table .feeTable tbody tr.head th:not(:first-child) span')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    // console.log(name);
    return cleanData(name);
}

function getDatas($) {
    let data = $('.table_style.mb40.charge_table .feeTable tbody tr:not(:first-child) th')
        .toArray()
        .map(function (node) {
            let reg = /\d+GB|\d+MB/g
            let dataAsString = $(node).text()
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0];
        })
        .filter(Boolean);
    // console.log(data);
    return cleanData(data);
}

function getPrices($) {
    let price = $('.table_style.mb40.charge_table table.feeTable tbody tr:not(:first-child) td')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    // console.log(price);
    return cleanData(price);
}

function getFusion(provider, tags, names, datas, prices) {
    console.log(names)
    console.log(datas)
    console.log(prices)
    let categories = []
    let plan = []
    let dataOnly = []
    let dataAndCall = []
    for (let i = 0; i < prices.length; i++) {
        let currentIndex = prices.indexOf(prices[i]);
        let currentPrice = prices[i];
        // console.log(currentIndex + " - " + currentPrice);
        if (currentIndex % 2 === 0) {
            dataOnly.push(currentPrice)
        } else {
            dataAndCall.push(currentPrice)
        }
    }

    console.log(dataOnly)
    console.log(dataAndCall)

    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            price: dataOnly[i]
        })
    }

    categories.push({
        name: names[0],
        plan: plan
    })

    plan = []
    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            price: dataAndCall[i]
        })
    }

    categories.push({
        name: names[1],
        plan: plan
    })

    return {
        provider: provider,
        tag: tags[0],
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
    fs.writeFile("mineo.json", dataAsString, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("File has been created");
    });
}