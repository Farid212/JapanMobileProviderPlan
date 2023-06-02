let xray = require('x-ray');
let fs = require('fs');
let x = xray();
let objectx = [{
  plan: 'h2.title',
  names: x('tbody tr:first-child td', [{
    name: "span",
  }]),
  datas: x('tbody tr:last-child td', [{
    data: "span",
  }]),
  prices: x('tbody tr:nth-child(2) td', [{
    price: "span",
  }]),
  options: x('tbody tr:nth-child(4)', [{
    option: "td"
  }])
}];
x('https://www.uqwimax.jp/plan/', 'html', objectx)
  .then(function cleanData(data) {
    let dataAsString = JSON.stringify(data);
    dataAsString = dataAsString.replace(/\s*\\n\s*/g, "");
    let cleanObj = JSON.parse(dataAsString);
    return cleanObj;
  })
  .then(function writeData(data) {
    let dataAsString = JSON.stringify(data, null, 2);
    fs.writeFile("test.json", dataAsString, err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("File has been created");
    });
  });