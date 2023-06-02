let cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('https://rokemoba.com/entry/plans', function (err, response, body) {
    if (err) {
        console.log('you already fuck up that shit');
    } else {
        const $ = cheerio.load(body);
        // console.log(body)

        const provider = getProvider();
        const tag = getTag();

        let docomoDataPlan = getDocomoDataPlanPrices($);
        console.log(docomoDataPlan);

        let data1 = getDocomoDataAndVoicePlanNames($);
        console.log(data1)

        // let data2 = getDocomoDataAndVoicePlanPrices();

        // let docomoDataAndVoicePlan = union(data1, data2);

        let softBankDataPlan = getSoftBankDataPlan($);
        console.log(softBankDataPlan);

        let docomoDataAndVoicePlanPrices = getDocomoDataAndVoicePlanPrices();
        console.log(docomoDataAndVoicePlanPrices);

    }
})



function getProvider() {
    return "ロケットモバイル";
}

function getTag() {
    return "rokemoba";
}

// return first complete (name and price) plan from HTML
function getDocomoDataPlanPrices($) {
    let planName = $('.block.only_docomo_data_plan_code .right .form-group .so_docomo .radio')
        .toArray()
        .map(function (node) {
            let dataAsString = $(node).text();
            let reg = /\d+GB/g
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return 'Basic Plan'
            }
            return parts[0]
        })



    let planPrice = $('.block.only_docomo_data_plan_code .right .form-group .so_docomo .radio')
        .toArray()
        .map(function (node) {
            let dataAsString = $(node).text();
            let reg = /\d+,\d+円|\d+円/g
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return 'Basic Plan'
            }
            return parts[0]
        })


    let docomo = [];

    for (let i = 0; i < planName.length; i++) {
        docomo.push({
            name: planName[i],
            price: planPrice[i]
        })
    }
    return docomo;
}

// return the name of second Plan (data capcity) from html
function getDocomoDataAndVoicePlanNames($) {
    let docomoVoicePlandata = $('.block.only_docomo_data_plan_code .right .form-group .so_docomo .radio')
        .toArray()
        .map(function (node) {
            let dataAsString = $(node).text();
            let reg = /\d+GB/g
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return 'Basic Plan'
            }
            return parts[0]
        })

    return docomoVoicePlandata;
}

function getDocomoDataAndVoicePlanPrices() {
    let dataPrice;
    request('https://rokemoba.com/assets/mypage/edit-72726f89c2496165184ad4f31aaee7f55db819eb6d03920a0b91442c397d3b72.js', function (err, response, body) {
        if (err) {
            console.log('error');
        } else {
            dataPrice = getPriceFromJsScript(body);
            // console.log(dataPrice);
        }

    });
    return dataPrice;
}

function getPriceFromJsScript(body) {
    console.log(body)
}

function union(data1, data2) {
    let docomo = [];
    for (let i = 0; i < data1.length; i++) {
        docomo.push({
            name: data1[i],
            price: data2[i]
        })
    }
    return docomo;
}

function getSoftBankDataPlan($) {
    let planName = $('.block.only_docomo_data_plan_code .right .form-group .so_softbank .radio')
        .toArray()
        .map(function (node) {
            let dataAsString = $(node).text();
            let reg = /\d+GB/g
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return 'Basic Plan'
            }
            return parts[0]
        })

    let planPrice = $('.block.only_docomo_data_plan_code .right .form-group .so_softbank .radio')
        .toArray()
        .map(function (node) {
            let dataAsString = $(node).text();
            let reg = /\d+,\d+円|\d+円/g
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return 'Basic Plan'
            }
            return parts[0]
        })

    let softbank = [];

    for (let i = 0; i < planName.length; i++) {
        softbank.push({
            name: planName[i],
            price: planPrice[i]
        })
    }

    return softbank
}

function cleanData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
    let cleanObj = JSON.parse(dataAsString);
    return cleanData(cleanObj)
}