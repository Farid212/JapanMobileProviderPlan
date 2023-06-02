let xray = require('x-ray');
let fs = require('fs');

let y = xray();

let objectY = [{
    Provider: ".md15Logo.Md28PcOnly img@alt",
    tag: "line_mobile",
    Plan: ".ExPlan03 h2",
    information: y(".LyPlanContentPriceTable02 dl:not(:first-child)", [{
        monthlyCapacity: "dt",
        dataSim: "dd:nth-child(2)",
        callSim: "dd:nth-child(3)"
    }])
}]


y('https://mobile.line.me/plan/music-plus/', 'body', objectY)
    .then(function cleanData(data) {
        let dataAsString = JSON.stringify(data);
        dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
        let cleanObj = JSON.parse(dataAsString);
        return cleanObj;
    })
    .then(function writeData(data) {
        let dataAsString = JSON.stringify(data, null, 2);
        fs.writeFile("line_music.json", dataAsString, (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been created");
        });
    })