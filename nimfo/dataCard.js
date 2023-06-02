let xray = require('x-ray');
let fs = require('fs');

let x = xray();

let object = [{
    Provider: "head title",
    Tag: "nifmo",
    category: '.hdg-l2-01:nth-child(1)',
    informations: x('.con312_list.height-adjust-enabled li', [{
        data: '.con312_box_02 ul li',
        price: '.con312_box_03 p'
    }])
}];

x('https://nifmo.nifty.com/sim/card_data.htm', 'html', object)
    .then(function cleanData(data) {
        let dataAsString = JSON.stringify(data);
        dataAsString = dataAsString.replace(/\s*\\n\s*/g, "");
        let cleanObj = JSON.parse(dataAsString);
        return cleanObj;
    })
    .then(function writeData(data) {
        let dataAsString = JSON.stringify(data, null, 2);
        fs.writeFile("nimfo_data_card.json", dataAsString, err => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("File has been created");
        });
    });