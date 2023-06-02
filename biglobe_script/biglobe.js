const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs');

var biglobe = {
    provider: "Biflobe",
    plans: {
        VoiceDataSmsTypeAD: [],
        DataSmsTypeAD: [],
        DataOnlyTypeD: []
    }
}

const getRawInfo = ($, selector) =>{
    let selections = $(selector)
        .toArray()
        .map((node) => $(node).text())

    return cleanData(selections)
}

const addPlanNameToEachGroup = (rawInfo) =>{
    rawInfo.map((el, key)=>{
        if(key % 4 == 0){
            // console.log(el)
            biglobe.plans.VoiceDataSmsTypeAD.push({
                plan: el,
                price: null
            })
            biglobe.plans.DataSmsTypeAD.push({
                plan: el,
                price: null
            })
            biglobe.plans.DataOnlyTypeD.push({
                plan: el,
                price: null
            })
        }
    })
}

const addPricesToPlan = (rawInfo, sp, groupPlan) =>{
    let prices = []
    for(let i = sp; i < rawInfo.length; i= i + 4){
        if(rawInfo[i]!==undefined){
            prices.push(rawInfo[i])
        }
    }
    
    for(let i = 0; i<prices.length; i++){
        groupPlan[i].price =  prices[i]
    }
}

const cleanData = (data) => {
	let dataAsString = JSON.stringify(data);
	dataAsString = dataAsString.replace(/\s*\\n\s*/g, "");
	let cleanObj = JSON.parse(dataAsString);
	return cleanObj;
}

const writeFile = (data) =>{
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

const req = (err, response, body) =>{
    if(err){
        console.error(err)
    } else {
        let plans = []
        const $ = cheerio.load(body)

        let rawInfo = getRawInfo($, '#plan tbody tr > *')

        // add the contract type of each plan
        addPlanNameToEachGroup(rawInfo)
        // add the prices to Voice Call + Data + SMS Sims : Type A + Type D 
        addPricesToPlan(rawInfo, 1, biglobe.plans.VoiceDataSmsTypeAD)
        //  add the prices to Data + SMS sims : Type A + Type D
        addPricesToPlan(rawInfo, 2, biglobe.plans.DataSmsTypeAD)
        // add the prices to Data Only sims : Type D
        addPricesToPlan(rawInfo, 3, biglobe.plans.DataOnlyTypeD)

        // console.log(biglobe.plans)
        writeFile(biglobe)
    }
}

request('https://join.biglobe.ne.jp/mobile/plan/', req)