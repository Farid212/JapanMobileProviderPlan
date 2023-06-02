let cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('http://dream.jp/mb/sim/', function (err, response, body) {
    if (err) {
        console.log('error')
    } else {
        const $ = cheerio.load(body)

        let provider = getProvider();
        let tag = getTag();
        let catName = getCategoryName($);
        // console.log(catName);
        let allPlan = getPlan($);
        // console.log(allPlan)
        let youWin = okashiDeshou(provider, tag, catName, allPlan);

        // console.log("before writing: " + JSON.stringify(youWin, null, 2))

        writeData(youWin);

    }
})

function getProvider() {
    return "DTI";
}

function getTag() {
    return "dti";
}

function getCategoryName($) {
    let category = $('.bgWrap ul.flex_two li .plan_name')
        .toArray()
        .map(
            function (node) {
                return $(node).text()
            }
        )
    return category;
}

function getPlan($) {
    let name = $('th')
        .toArray()
        .map(function (node) {
            let reg = /\d+GB|(ネットつかい放題)/g;
            let dataAsString = $(node).text()
            let parts = reg.exec(dataAsString);
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean)
    // name.shift()
    name = cleanData(name);

    let price = $('.flex_two li table tbody tr td')
        .toArray()
        .map(function (node) {
            let reg = /\d+,\d+円|\d+円/g
            let dataAsString = $(node).text()
            let parts = reg.exec(dataAsString)
            if (!parts) {
                return null
            }
            return parts[0]
        })
        .filter(Boolean)
    // price.splice()
    price = cleanData(price)

    let plan = [];

    for (let i = 0; i < name.length; i++) {
        plan.push({
            name: name[i],
            price: price[i]
        })
    }
    return plan
}

function okashiDeshou(provider, tag, catName, allPlan) {
    // console.log(catName)
    // console.log(allPlan)
    let categories = []
    let plan = []

    let superCutHalf = Math.floor(allPlan.length / 2);

    plan.push(allPlan.slice(0, superCutHalf))
    plan.push(allPlan.slice(superCutHalf, allPlan.length))

    // console.log(plan)

    for (let i = 0; i < catName.length; i++) {
        categories.push({
            name: catName[i],
            plan: plan[i]
        })
    }

    // console.log(JSON.stringify(categories, null, 1));

    return {
        provider: provider,
        tag: tag,
        categories
    }


}

function cleanData(data) {
    let dataAsString = JSON.stringify(data, null, 2)
    dataAsString.replace(/\s*\\˜\s*/g, '')
    let cleanObject = JSON.parse(dataAsString)
    return cleanObject;
}


const writeData = (data) =>{
    let thisYear = new Date().getFullYear()
    let dataAsString = JSON.stringify(data, null, 2)
    fs.writeFile(`${thisYear}.json`, dataAsString, err=>{
        if(err){
            console.error(err);
            return;
        }
        console.log('File created');
    })
}