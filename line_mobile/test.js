let obj = require('./line_data.json');
console.log(obj.categories[1])
console.log(JSON.stringify(obj, null, 2))
 let newJson = {
     provider: obj.provider,
     tag: obj.tag,
     categories: obj.categories[1]
 }

 console.log(JSON.stringify(newJson, null, 2))