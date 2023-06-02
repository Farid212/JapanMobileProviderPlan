let cheerio = require('cheerio');
let fs = require('fs');
let request = require('request');



(()=>{
    const provider = getProvider();
    const tag = getTag();
    let plan1;
    let plan2;



    function finalRequest(){
        let senenGoroshi = hiddentaijutsuOugi(provider, tag, plan1, plan2)

        let senenGoroshiKAI = {
            provider: senenGoroshi.provider,
            tag: senenGoroshi.tag,
            categories: senenGoroshi.categories[1]
        }

        writeData(senenGoroshiKAI);
    }

    function request1 (err, response, body){
        if(err){
            console.log('error request1')
        }else{
            let $ = cheerio.load(body)

            let name = getName($);
            let sim = getPlan($);
            plan1 = getFusion(name, sim)
    
            request('https://mobile.line.me/plan/music-plus/', request2)
        }
    }
    
    function request2 (err, response, body){
        if(err){
            console.log('error')
        }else{
            let $ = cheerio.load(body);

            let name = getName($)
            let sim = getPlan($)
            plan2 = getFusion(name, sim)

            finalRequest();
        }
    }

    request('https://mobile.line.me/plan/communication-free/', request1)
}) ();

function getProvider(){
    return "LINE"
}

function getTag(){
    return "baka"
}

function getName($){
    let data = $('.LyPlanContentPriceTable02 dl:not(:first-child) dt')
    .toArray()
    .map(function (node){
        return $(node).text()
    })
    // console.log("data: "+ JSON.stringify(cleanData(data), null, 2))
    return cleanData(data)
}

function getPlan($){
    let dataSim = $('.LyPlanContentPriceTable02 dl:not(:first-child) dd:nth-child(2)')
    .toArray()
    .map(function(node){
        let reg = /\d+,\d+円/g
        let dataAsString = $(node).text();
        let parts = reg.exec(dataAsString);
        if(!parts){
            return null
        }
        return cleanData(parts[0])
    })
    // console.log("dataSim: "+ JSON.stringify(cleanData(dataSim), null, 2))
    let callSim = $('.LyPlanContentPriceTable02 dl:not(:first-child) dd:nth-child(3)')
    .toArray()
    .map(function (node){
        let reg = /\d+,\d+円/g
        let dataAsString = $(node).text();
        let parts = reg.exec(dataAsString);
        if(!parts){
            return null;
        }
        return cleanData(parts[0])
    })
    // console.log("callSim: "+JSON.stringify(cleanData(callSim), null, 2))
    let pricePlan = []
    pricePlan.push({
        dataSim: dataSim,
        callSim: callSim
    })

    return pricePlan
}

function getFusion(name, sim){
    let plan = []
    let categories = []

    for(let i = 0; i<name.length; i++){
        plan.push({
            name: name[i],
            price: sim[0].dataSim[i]
        })
    }
    categories.push({
        name: "Data Sim",
        plan
    })

    plan = []
    for(let i = 0; i<name.length; i++){
        plan.push({
            name: name[i],
            price: sim[0].callSim[i]
        })
    }
    categories.push({
        name: "Call Sim",
        plan
    })
    

    // console.log(JSON.stringify(categories, null, 2))

    return categories;

}

function hiddentaijutsuOugi(provider, tag, plan1, plan2){
    let categories = []
    categories.push(plan1)
    categories.push(plan2)
    // console.log(JSON.stringify(plan, null, 2))

    return {
        provider: provider,
        tag: tag,
        categories
    }
}

function cleanData(data) {
    let dataAsString = JSON.stringify(data);
    dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
    let cleanObj = JSON.parse(dataAsString);
    return cleanObj;
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("line_data.json", dataAsString, (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
}
