let xray = require('x-ray');
let fs = require('fs');

let x = xray();

let objectX = [{
    Provider: ".md15Logo.Md28PcOnly img@alt",
    tag: "line_mobile",
    Plan: ".LyPlanContentPrice h2",
    information: x(".LyPlanContentPriceTable02 dl:not(:first-child)", [{
        monthlyCapacity: "dt",
        dataSim: "dd:nth-child(2)",
        callSim: "dd:nth-child(3)"
    }])
}]


x('https://mobile.line.me/plan/communication-free/', 'body', objectX)
    .then(function cleanData(data) {
        let dataAsString = JSON.stringify(data);
        dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
        let cleanObj = JSON.parse(dataAsString);
        return cleanObj;
    })
    .then(function writeData(data) {
        let dataAsString = JSON.stringify(data, null, 2);
        fs.writeFile("line_com_fee.json", dataAsString, (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been created");
        });
    })