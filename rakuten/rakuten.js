let cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('https://mobile.rakuten.co.jp/fee/alacarte/', function (err, response, body) {
    if (err) {
        console.log('hey wtf are you doing??? fix that shit!!!');
    } else {
        const $ = cheerio.load(body);

        const provider = getProvider();
        const tag = getTag();
        let datas = getDatas($);
        // console.log(datas);
        let voicePlanPrices = getVoicePlanPrices($);
        // console.log(voicePlanPrices);
        let dataSmsPlanPrices = getDataSmsPlanPrices($);
        // console.log(dataSmsPlanPrices);
        let dataPlanPrices = getDataPlanPrices($);
        // console.log(dataPlanPrices);
        let hiddenTaijutsuHogi = senenGoroshii(provider, tag, datas, voicePlanPrices, dataSmsPlanPrices, dataPlanPrices);

        // console.log(hiddenTaijutsuHogi);

        writeData(hiddenTaijutsuHogi);

    }
})

function getProvider() {
    return "楽天モバイル";
}

function getTag() {
    return "rakuten_mobile";
}

function getDatas($) {
    let data = $('.box.center table tbody tr:not(:nth-child(1)) th')
        .toArray()
        .map(function (node) {
            let reg = /\d+GB|\d.\d+GB/g;
            let dataAsString = $(node).text();
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return 'Basic Plan'
            }
            return parts[0]
        })

    return cleanData(data);
}

function getVoicePlanPrices($) {
    let voicePrice = $('.box.center table tbody tr td:nth-child(2)')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    return cleanData(voicePrice);
}

function getDataSmsPlanPrices($) {
    let dataSmsPrice = $('.box.center table tbody tr td:nth-child(3)')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    return cleanData(dataSmsPrice);
}

function getDataPlanPrices($) {
    let dataPlanPrice = $('.box.center table tbody tr td:nth-child(4)')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })
    return cleanData(dataPlanPrice);
}

function senenGoroshii(provider, tag, datas, voicePlanPrices, dataSmsPlanPrices, dataPlanPrices) {
    // console.log(voicePlanPrices)
    // console.log(datas);
    // console.log(dataSmsPlanPrices)
    // console.log(dataPlanPrices)
    let plan = []
    let categories = []

    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            plan: voicePlanPrices[i]
        })
    }
    categories.push({
        name: "Voice plan",
        plan: plan
    })

    plan = []
    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            plan: dataSmsPlanPrices[i]
        })
    }
    categories.push({
        name: "Data & Sms plan",
        plan: plan
    })

    plan = []
    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            plan: dataPlanPrices[i]
        })
    }
    categories.push({
        name: "Data plan",
        plan: plan
    })
    plan = []

    // console.log(JSON.stringify(categories, null, 2));

    return {
        provider: provider,
        tag: tag,
        categories: categories
    }

}

function cleanData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
    let cleanObj = JSON.parse(dataAsString);
    return cleanObj
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("rakuten_data.json", dataAsString, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("File has been created");
    });
}