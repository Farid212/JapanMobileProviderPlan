let xray = require("x-ray");
let fs = require("fs");

let x = xray();

let object = [{
    Provider: ".service_logo a img@alt",
    tag: "ocn_voice",
    plans: x(".HTML.section:nth-child(3)", [{
        planName: "h3",
        initialCost: x('.price-inner .price01 .scroll-box table tbody tr', [{
            data: "td:nth-child(1)",
            price: "td:nth-child(2)"
        }]),
        subOptions: x('#main', [{
            subOptionsName: "h3 span",
            subCost: x('#main table tbody tr:not(:nth-child(1))', [{
                data: "tr td.cel_middle_hq.pb5",
                price: "tr td.tdEnd.cel_middle_hq"
            }])
        }])
    }])
}];

x("https://www.ntt.com/personal/services/mobile/one/sms-sim.html", 'body', object)
    .then(function cleanData(data) {
        let dataAsString = JSON.stringify(data);
        dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
        let cleanObj = JSON.parse(dataAsString);
        return cleanObj;
    })
    .then(function writeData(data) {
        let dataAsString = JSON.stringify(data, null, 2);
        fs.writeFile("ocn_plan_sms.json", dataAsString, (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been created");
        });
    })