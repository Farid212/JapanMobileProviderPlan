let Xray = require('x-ray');
let fs = require('fs');


let x = Xray();


let objectX = [{
    provider: "",
    tag: "",
    Categories: x('#plan .m-feeContents__item table', [{
        name: 'table thead tr th',
        plan: x('table tbody tr', [{
            name: 'th:nth-child(1)',
            price: 'td:nth-child(2)'
        }]),
    }])
}];



x('https://mvno.dmm.com/fee/index.html#single-dataSim', 'body', objectX)
    .then(function (data) {
        data[0].provider = "DMM mobile"
        data[0].tag = "dmm_mobile"
        return data;
    })
    .then(function cleanData(data) {
        let dataAsString = JSON.stringify(data);
        dataAsString = dataAsString.replace(/\s*\\n\s*/g, '');
        let cleanObj = JSON.parse(dataAsString);
        return cleanObj[0];
    })
    .then(function writeData(data) {
        let dataAsString = JSON.stringify(data, null, 2);
        fs.writeFile(`dmm_mobile${new Date().getFullYear()}.json`, dataAsString, (err) => {
            if (err) {
                console.error(err);
                return;
            };
            console.log("File has been created");
        });
    })