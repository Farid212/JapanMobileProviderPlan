const cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('https://his-mobile.com/plan/sim-domestic/best-choice/', function (error, response, body) {
    if (error) {
        console.log('error');
    } else {
        const $ = cheerio.load(body);
        // console.log(body);
        const $provider = getProvider($);
        const $tag = "his_mobile_d";
        const $planName = "best-choice";

        let data = body;
        let reg = /\('\.best-choice-price-([^-]+)-([a-z]{2})'\)\.html\('([0-9,]{3,5}円)'\)/g;
        let parts;
        let JsonFile = [];



        while (parts = reg.exec(data)) {
            // console.log(parts[0]);
            let dataCapacity = parts[1];
            let plan = parts[2];
            let price = parts[3];

            let $infoPlan = createObjectData(dataCapacity, plan, price);
            // console.log($infoPlan);

            JsonFile.push($infoPlan);
        }
        // console.log(JsonFile);

        let $fileToWrite = completeJsonFile($provider, $tag, $planName, JsonFile);

        // console.log($fileToWrite);

        writeData($fileToWrite);

    }
});

function getProvider($) {
    let provider = $('.title01:nth-child(2)').text();
    return provider;
}

function createObjectData(data, plan, price) {
    if (plan == "nd") {
        plan = "Docomo";
    } else {
        plan = "SoftBank";
    }

    infoPlan = {
        dataCapacity: data,
        operator: plan,
        price: price
    };

    return infoPlan;
}

function completeJsonFile($provider, $tag, $planName, JsonFile) {
    fileToWrite = [{
        Provider: $provider,
        Tag: $tag,
        PlanName: $planName,
        DetailsPlan: JsonFile
    }];
    return fileToWrite;
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("Best-Choise-Plan.json", dataAsString, (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
}