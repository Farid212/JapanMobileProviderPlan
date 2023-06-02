let cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('http://mobile.nuro.jp/service.html', function (err, response, body) {
    if (err) {
        console.log('error');
    } else {
        const $ = cheerio.load(body);

        const provider = getProvider();
        const tag = getTag();
        let datas = getDatas($);
        // console.log(datas)
        let dataPrices = getDataPrices($);
        // console.log(dataPrices)
        let dataSmsPrices = getDataSmsPrices($);
        // console.log(dataSmsPrices);
        let dataSmsCallPrices = getDataSmsCallPrices($);
        // console.log(dataSmsCallPrices);
        let arrOfObject = getArrayOfObject(datas, dataPrices, dataSmsPrices, dataSmsCallPrices);
        console.log(arrOfObject);
        let jsonDatas = createJsonDatas(provider, tag, arrOfObject);
        // console.log(freeOtoro);
        writeData(jsonDatas);

    }
})

function getProvider() {
    return "nuroモバイル";
}

function getTag() {
    return "nuro_mobile";
}

function getDatas($) {
    let data = $('.mb0:nth-child(1) table tbody td:nth-child(1)')
        .toArray()
        .map(function (node) {
            let reg = /\d+GB/g;
            let dataAsString = $(node).text();
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean)
    return cleanData(data);
}

function getDataPrices($) {
    let dataPricePlan = $('.mb0:nth-child(1) table tbody tr td:nth-child(2)')
        .toArray()
        .map(function (node) {
            return $(node).text()
        })
    dataPricePlan = dataPricePlan.splice(1, 9)

    return cleanData(dataPricePlan)
}

function getDataSmsPrices($) {
    let dataSmsPrice = $('.mb0:nth-child(1) table tbody tr td:nth-child(3)')
        .toArray()
        .map(function (node) {
            return $(node).text()
        })
    dataSmsPrice = dataSmsPrice.splice(1, 9)
    return cleanData(dataSmsPrice)
}

function getDataSmsCallPrices($) {
    let dataSmsCallPrice = $('.mb0:nth-child(1) table tbody tr td:nth-child(4)')
        .toArray()
        .map(function (node) {
            return $(node).text()
        })
    dataSmsCallPrice = dataSmsCallPrice.splice(1, 9)
    return cleanData(dataSmsCallPrice)
}

function getArrayOfObject(datas, dataPrices, dataSmsPrices, dataSmsCallPrices) {
    let plan = []
    let categories = []

    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            price: dataPrices[i]
        })
    }
    categories.push({
        name: "data only",
        plan: plan
    })

    plan = []
    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            price: dataSmsPrices[i]
        })
    }
    categories.push({
        name: "data and sms",
        plan: plan
    })

    plan = []
    for (let i = 0; i < datas.length; i++) {
        plan.push({
            name: datas[i],
            price: dataSmsCallPrices[i]
        })
    }
    categories.push({
        name: "data, sms & call",
        plan: plan
    })

    // console.log(JSON.stringify(categories, null, 2))

    return categories
}

function createJsonDatas(provider, tag, arrOfObject) {
  let obj = {
      provider: provider,
      tag: tag,
      categories: arrOfObject
  };

  return obj;

}

function cleanData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
    let cleanObj = JSON.parse(dataAsString);
    return cleanObj
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("nuro_data_2021.json", dataAsString, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("File has been created");
    });
}
