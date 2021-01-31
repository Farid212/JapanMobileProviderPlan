const cheerio = require("cheerio");
const request = require("request");
const fs = require('fs');

var bmobile = {
    provider: "b-mobile",
    plans: {
        jfsim : null,
        sim_190: null
    }
}

const getDataInfo = ($, selector) =>{
    let dataCapacity = $(selector)
        .toArray()
		.map((node) =>{
			return($(node).text())
		})        
	return cleanData(dataCapacity);
}

const cleanData = (data) => {
	let dataAsString = JSON.stringify(data);
	dataAsString = dataAsString.replace(/\s*\\n\s*/g, "");
	let cleanObj = JSON.parse(dataAsString);
	return cleanObj;
}

const req1 = ( err, response, body) =>{
    if(err){
        console.error(err)
    } else {
        let plans = []
        const $ = cheerio.load(body)
    
        let rawInfo = getDataInfo($, '.sb_common_table tbody tr > *')
        for(let i = 2; i<rawInfo.length; i = i+2){
            plans.push({
                dataLimit: rawInfo[i],
                monthlyFee: i + 1 < rawInfo.length ? rawInfo[i+1] : undefined,
            })
        }
        plans = plans.slice(0,5)
        bmobile.plans.jfsim = plans
    }
}   

const req2 = ( err, response, body) => {
    if(err){
        console.error(err)
    } else{
        let plans = []
        const $ = cheerio.load(body)
    
        let rawInfo = getDataInfo($, '.sb_common_table tbody tr > *')
        for(let i = 3; i<rawInfo.length; i = i+3){
            plans.push({
                dataLimit: rawInfo[i],
                priceWithCom: i + 1 < rawInfo.length ? rawInfo[i+1] : undefined,
                priceWithSms: i + 2 < rawInfo.length ? rawInfo[i+2] : undefined
            })
        }
        plans = plans.slice(0,6)
        bmobile.plans.sim_190 = plans
        // console.log('r2',bmobile.plans)
    }
}

const writeFile = (data) =>{
    let thisYear = new Date().getFullYear()
    let dataAsString = JSON.stringify(data, null, 2)
    fs.writeFile(`b-mobile${thisYear}.json`, dataAsString, err=>{
        if(err){
            console.error(err);
            return;
        }
        console.log('File created');
    })
}

request("http://www.bmobile.ne.jp/jfsim/plan_voice.html", req1)
request("http://www.bmobile.ne.jp/190sim/plan_post.html", req2)


setTimeout(()=>{
    writeFile(bmobile)    
}, 2000)