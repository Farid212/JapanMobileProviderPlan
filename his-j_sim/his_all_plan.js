const cheerio = require('cheerio');
let request = require('request');
let fs = require('fs');

request('https://his-mobile.com/plan/sim-domestic/best-choice/', function (error, response, body) {
    if (error) {
        console.log('error');
    } else {
        const $ = cheerio.load(body);
        // console.log(body);
        const $provider = getProvider();
        const $tag = "his_mobile_d";
        let categories = []
        let infoPlan1 = [];
        let infoPlan2 = [];
        let infoPlan3 = [];
        let infoPlan4 = [];

        let data = body;
        let reg = /\('\.best-choice-price-([^-]+)-(nd)'\)\.html\('([0-9,]{3,5}円)'\)/g;
        let reg2 = /\('\.data-net-pitatto-price-([^-]+)-(nd)'\)\.html\('([0-9,]{3,5}円)'\)/g;
        let reg3 = /\('\.net-pitatto-price-([^-]+)-(nd)'\)\.html\('([0-9,]{3,5}円)'\)/g;
        let reg4 = /\('\.call-unlimited-price-([^-]+)-(nd)'\)\.html\('([0-9,]{3,5}円)'\)/g;
        let parts;
        let parts2;
        let parts3;
        let parts4;

        // Plan Best Choice Price
        while (parts = reg.exec(data)) {
            let name = parts[1];
            let plan = parts[2];
            let price = parts[3];

            infoPlan1.push(createObjectData(name, plan, price));
        }
        categories.push({
            name: "best choice",
            plan: infoPlan1
        });

        // Plan Data Net Pitatto Price
        while (parts2 = reg2.exec(data)) {
            let name = parts2[1];
            let plan = parts2[2];
            let price = parts2[3];

            infoPlan2.push(createObjectData(name, plan, price));
        }
        categories.push({
            name: "data net pitatto",
            plan: infoPlan2
        });

        // Plan Net Pitatto Price
        while (parts3 = reg3.exec(data)) {
            let name = parts3[1];
            let plan = parts3[2];
            let price = parts3[3];

            infoPlan3.push(createObjectData(name, plan, price));
        }
        categories.push({
            name: "net pitatto",
            plan: infoPlan3
        })

        // Plan Call Unlimited Price
        while (parts4 = reg4.exec(data)) {
            let name = parts4[1];
            let plan = parts4[2];
            let price = parts4[3];

            infoPlan4.push(createObjectData(name, plan, price));
        }
        categories.push({
            name: "call unlimited",
            plan: infoPlan4
        })

        console.log("caca: " + JSON.stringify(categories, null, 2))

        let fileToWrite = {
            provider: $provider,
            tag: $tag,
            categories: categories
        }

        // console.log(fileToWrite);

        writeData(fileToWrite);

    }
});

function getProvider() {
    return "H.I.S モバイル";
}

function createObjectData(data, plan, price) {
    info = {
        name: data,
        price: price,
    };

    return info;
}

function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("his_all_plan.json", dataAsString, (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
}