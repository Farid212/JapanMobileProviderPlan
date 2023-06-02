const cheerio = require('cheerio');
let request = require("request");
let iconv = require("iconv-lite");
let fs = require("fs");




request('https://www.iijmio.jp/hdd/spec/', {
    encoding: null
}, function (error, response, bodyShiftJIS) {
    if (error) {
        console.log('error ');
    } else {
        let darkVador = getProvider();
        let tag = getTag();

        const bodyUtf8 = iconv.decode(
            response.body,
            'shift_jis'
        );
        $ = cheerio.load(bodyUtf8);

        let pricesDataSimTypeD = getPricesDataSimTypeD($);
        // console.log(pricesDataSimTypeD)

        let pricesSmsSimTypeD = getPricesSmsSimTypeD($);
        // console.log(pricesSmsSimTypeD)

        let pricesSmsSimTypeA = getPricesSmsSimTypeA($);
        // console.log(pricesSmsSimTypeA)

        let pricesVoiceSimTypeDandA = getPricesVoiceSimTypeDandA($);
        // console.log(pricesVoiceSimTypeDandA)

        let planAndType = getPlanAndType($);
        // console.log(planAndType)

        let blabladata = getBlabaladata();
        // console.log(blabladata)


        let categories = getCategories(pricesDataSimTypeD, pricesSmsSimTypeD, pricesSmsSimTypeA, pricesVoiceSimTypeDandA, planAndType, blabladata)

        console.log(JSON.stringify(categories, null, 2))

        let jsonToWrite = completeJsonFile(darkVador, tag, categories);

        writeData(jsonToWrite);

    }
});

function getCategories(pricesDataSimTypeD, pricesSmsSimTypeD, pricesSmsSimTypeA, pricesVoiceSimTypeDandA, planAndType, blabladata) {
    let plan = []

    // for (let i = 0; i < planAndType.length; i++) {
    //     console.log(i + JSON.stringify(planAndType[i], null, 2))
    // }

    for (let i = 0; i < blabladata.length; i++) {
        plan.push({
            name: blabladata[i],
            price: pricesDataSimTypeD[i]
        })
    }
    planAndType[0].plan = plan
    // console.log(planAndType[0])

    plan = []
    for (let i = 0; i < blabladata.length; i++) {
        plan.push({
            name: blabladata[i],
            price: pricesSmsSimTypeD[i]
        })
    }
    planAndType[1].plan = plan
    // console.log(planAndType[1])

    plan = []
    for (let i = 0; i < blabladata.length; i++) {
        plan.push({
            name: blabladata[i],
            price: pricesSmsSimTypeA[i]
        })
    }
    planAndType[2].plan = plan
    // console.log(planAndType[2])

    plan = []
    for (let i = 0; i < blabladata.length; i++) {
        plan.push({
            name: blabladata[i],
            price: pricesVoiceSimTypeDandA[i]
        })
    }
    planAndType[3].plan = plan
    // console.log(planAndType[3])

    return planAndType

}


function getBlabaladata() {
    return ["6", "12", "24"]
}

function getPlanAndType($) {
    let info1 = $('.spec_monthlycost_simTitle')
        .toArray()
        .map(function (node) {
            return $(node).text()
        })
    let info2 = $('.spec_monthlycost_simType li')
        .toArray()
        .map(function (node) {
            return $(node).text().replace(/\s*\\n\s*/g, '')
        })

    // console.log(JSON.stringify(info1, null, 2) + " - " + JSON.stringify(info2, null, 2))
    let info = []
    info.push({
        name: info1[0] + " - " + info2[0],
        plan: [{}]
    })
    info.push({
        name: info1[1] + " - " + info2[1],
        plan: [{}]
    })
    info.push({
        name: info1[1] + " - " + info2[2],
        plan: [{}]
    })
    info.push({
        name: info1[2] + " - " + info2[3] + " - " + info2[4],
        plan: [{}]
    })
    // console.log(info);

    return info
}

function getPricesVoiceSimTypeDandA($) {
    let info = $('.spec_monthlycost_simBox.voicesim.cp .spec_monthlycost_simPriceBox li')
        .toArray()
        .map(function (node) {
            return parseInt(
                $(node)
                .find('.numFont:nth-child(2)')
                .text()
                .replace(/,/g, ''), 10
            )
        });
    return info;
}

function getPricesSmsSimTypeA($) {
    let info = $('.spec_monthlycost_hasdetails.typea')
        .toArray()
        .map(function (node) {
            return parseInt(
                $(node)
                .find('.numFont')
                .text()
                .replace(/,/g, ''), 10
            )
        });
    return info
}

function getPricesSmsSimTypeD($) {
    let info = $('.spec_monthlycost_hasdetails.typed')
        .toArray()
        .map(function (node) {
            // console.log(node);
            return parseInt(
                $(node)
                // .find('.spec_monthlycost_hasdetails.typed')
                .find('.numFont')
                .text()
                .replace(/,/g, ''), 10
            )
        });
    return info
}

function getPricesDataSimTypeD($) {
    let info = $('.spec_monthlycost_simBox:first-child .spec_monthlycost_simPriceBox li')
        .toArray()
        .map(function (node) {
            return parseInt(
                $(node)
                .find('.numFont')
                .text()
                .replace(/,/g, ''), 10)
        });
    return info
}

function getProvider() {
    return "比較表 | 格安SIM / 格安スマホのIIJmio";
}

function getTag() {
    return "iijmio"
}

function completeJsonFile(darkVador, tag, categories) {
    fileToWrite = [{
        provider: darkVador,
        tag: tag,
        categories: categories
    }];

    return fileToWrite;
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("iijmio_sim.json", dataAsString, err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    });
}