let cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('https://aeonmobile.jp/plan/', function (err, response, body) {
    if (err) {
        console.log('error');
    } else {
        const $ = cheerio.load(body);

        const provider = getProvider();
        const tag = getTag();
        let voicePlan = getVoicePlan($);
        // console.log(voicePlan);
        let dataPlan = getDataPlan($);
        // console.log(dataPlan);
        let sharePlan = getSharePlan($);
        // console.log(sharePlan);
        let whichChocolateDoYouLike = iLoveMilkChocolet(provider, tag, voicePlan, dataPlan, sharePlan);
        // console.log(whichChocolateDoYouLike);
        writeData(whichChocolateDoYouLike);

    }
})

function getProvider() {
    return "イオンモバイル";
}

function getTag() {
    return "aeon_mobile"
}

function getVoicePlan($) {
    let plan = [];
    let category = "VOICE Plan";

    let name = $('.priceList .voiceSim table tbody tr th')
        .toArray()
        .map(function (node) {
            return $(node).text();
        })


    let price = $('.priceList .voiceSim table tbody tr td')
        .toArray()
        .map(function (node) {
            let reg = /\d+,\d+円/g;
            let dataAsString = $(node).text();
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean);

    for (let i = 0; i < name.length; i++) {
        plan.push({
            name: name[i],
            price: price[i]
        })
    }

    plan = {
        category,
        plan
    }

    return plan;


}

function getDataPlan($) {
    let plan = [];
    let category = "DATA Plan";

    let name = $('.priceList .dataSim table tbody tr th')
        .toArray()
        .map(function (node) {

            let parts = $(node).text();

            if (!parts) {
                return null
            }
            return parts
        })
        .filter(Boolean);

    let price = $('.priceList .dataSim table tbody tr td')
        .toArray()
        .map(function (node) {
            let reg = /\-|\d+,\d+円|\d+円/g;
            let dataAsString = $(node).text();
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean);

    for (let i = 0; i < name.length; i++) {
        plan.push({
            name: name[i],
            price: price[i]
        })
    }

    plan = {
        category,
        plan
    }

    return plan;

}

function getSharePlan($) {
    let plan = [];
    let category = "SHARE Plan";

    let name = $('.priceList .sharePlan table tbody tr th')
        .toArray()
        .map(function (node) {
            return $(node).text()
        })


    let price = $('.priceList .sharePlan table tbody tr td')
        .toArray()
        .map(function (node) {
            let reg = /\-|\d+,\d+円|\d+円/g;
            let dataAsString = $(node).text();
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean);

    for (let i = 0; i < name.length; i++) {
        plan.push({
            plan: name[i],
            price: price[i]
        })
    }

    plan = {
        category,
        plan
    }

    return plan;

}

function iLoveMilkChocolet(provider, tag, voicePlan, dataPlan, sharePlan) {
    let dada = [voicePlan, dataPlan, sharePlan];

    let categories = [];

    for (let tempoVar of dada) {
        categories.push(tempoVar)
    }

    return {
        provider: provider,
        tag: tag,
        categories
    }
}

function writeData(data) {
    let thisYear = new Date().getFullYear()
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile(`aeon_data${thisYear}.json`, dataAsString, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("File has been created");
    });
}