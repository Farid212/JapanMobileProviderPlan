const cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");






function req1(err, response, body) {
	if (err) {
		console.log("error request 1");
	} else {
		const $ = cheerio.load(body);

		let planName = getPlanName($);

		let datasSize = getDataInformation($);

		let pricesDatasSize = getPriceDataSizePlans($);

		plan1 = getPlan(planName, datasSize, pricesDatasSize);

		return plan1
		
	}
};

function req2(err, response, body) {
	if (err) {
		console.log("error request 2");
	} else {
		const $ = cheerio.load(body)
		let planNameDataPadSim = getPlanDataPadSim($);

		plan2 = getPlanPriceOnlyPadSim($, planNameDataPadSim);

		return plan2
	}
};

function init() {
	const provider = getProvider();
	// console.log(provider);
	const tag = getTag();
	// console.log(tag);
	let plan1 = request("http://www.bmobile.ne.jp/jfsim/plan_voice.html", req1);
	let plan2 = request("http://www.bmobile.ne.jp/190sim/plan_post.html", req2);
	console.log(plan1)
	if(plan1 && plan2){
		finalReq(provider, tag, plan1, plan2)
	}
}

function finalReq(provider, tag, plan1, plan2) {
	let categories = getFusion(plan1, plan2);
	// console.log("cats: " + JSON.stringify(categories, null, 2));
	let dataToWrite = getAllPlans(provider, tag, categories);
	writeData(dataToWrite);
};

init();

function getPlan(planName, datasSize, pricesDatasSize) {
	let plan = []
	let name = datasSize;
	let price = pricesDatasSize.slice(0, 15);

	// console.log(name.length)
	// console.log(price.length + price)

	for (let i = 0; i < name.length; i++) {
		plan.push({
			name: name[i],
			price: price[i]
		})
	}
	// console.log(plan);

	plan = {
		name: planName,
		plan
	}

	// console.log(plan)

	return plan
}

function getPlanPriceOnlyPadSim($, planNameDataPadSim) {
	let data = $(".content_all table.sb_common_table tbody tr td").toArray();
	data = shittyIdea($, data, planNameDataPadSim);
	// console.log('verification data: ' + JSON.stringify(data, null, 2));
	// return object
	return data;
}

function shittyIdea($, data, planNameDataPadSim) {
	let plan1 = [];
	let plan2 = [];
	let plan = [];
	let names = [];

	// this separet 2 price plan
	for (let i = 0; i < data.length; i++) {
		if (i % 2 == 0) {
			let price = $(data[i]).text();
			// console.log('data only price: ' + part);
			plan1.push({
				price
			});
		} else {
			let price = $(data[i]).text();
			// console.log('data only price: ' + part);
			plan2.push({
				price
			});
		}
	}
	plan1 = plan1.slice(0, 11);

	for (let i = 0; i < planNameDataPadSim.length; i++) {
		let name = planNameDataPadSim[i];
		names.push({
			name
		});
	}
	plan2 = plan2.slice(0, 11);

	for (let i = 0; i < names.length; i++) {
		console.log('n:'+names[i].name)
		console.log('p:'+plan[i])
		plan.push({
			name: names[i].name,
			price: plan1[i].price
		});
	}

	plan = {
		name: "データ通信専用",
		plan
	};

	let categories = [];

	categories.push(plan);

	// console.log("phase 1: " + JSON.stringify(categories, null, 2));

	plan = [];

	for (let i = 0; i < names.length; i++) {
		plan.push({
			name: names[i].name,
			price: plan2[i].price
		});
	}

	plan = {
		name: "SMS付き",
		plan
	};
	categories.push(plan);

	// console.log("phase 2: " + JSON.stringify(categories, null, 2));
	return categories;
}

function getPlanDataPadSim($) {
	let data = $(".sb_common_table tbody tr")
		.toArray()
		.map(function (node) {
			return $(node).text();
		});

	console.log()
	data = data.slice(3, 14);
	return data;
}

function getPriceDataSizePlans($) {
	let allplansprices = $(".sb_common_table tbody tr:not(:nth-child(1)) td")
		.toArray()
		.map(function (node) {
			let reg = /\d{3}円|\d+\,\d+円/g;
			let dataAsString = $(node).text();
			let dataShouldPassTheExec = reg.exec(dataAsString);
			if (!dataShouldPassTheExec) {
				return null;
			}
			return dataShouldPassTheExec[0];
		})
		.filter(Boolean);
	// console.log('allPlansPrices: ' + allplansprices);
	return cleanData(allplansprices);
}

function getPlanName($) {
	let planVoiceTitles = cleanData(
		$(".plan_voice_title")
		.toArray()
		.map(function (node) {
			return $(node).text();
		})
	);
	// The second title is the plan Name!!!
	return planVoiceTitles[2];
}

function getDataInformation($) {
	dataCapacity = $(".sb_common_table tbody tr:not(:nth-child(1)) th")
		.toArray()
		.map(function (node) {
			let reg = /\d+GB/g;
			let dataAsString = $(node).text();
			let parts = reg.exec(dataAsString);
			if (!parts) {
				return null;
			}
			return parts[0];
		})
		.filter(Boolean);
	return cleanData(dataCapacity);
}

function getProvider() {
	return "b-mobile";
}

function getTag() {
	return "b_mobile_s";
}

function cleanData(data) {
	let dataAsString = JSON.stringify(data);
	dataAsString = dataAsString.replace(/\s*\\n\s*/g, "");
	let cleanObj = JSON.parse(dataAsString);
	return cleanObj;
}

function writeData(data) {
	let thisYear = new Date().getFullYear()
	let dataAsString = JSON.stringify(data, null, 2);
	fs.writeFile(`bmobile${thisYear}.json`, dataAsString, err => {
		if (err) {
			console.error(err);
			return;
		}
		console.log("File has been created");
	});
}

function getAllPlans(provider, tag, categories) {
	let youWin = {
		provider: provider,
		tag: tag,
		categories
	};
	return youWin;
}

function getFusion(plan1, plan2) {
	let categories = []
	categories.push(plan1);
	categories.push(plan2);
	// console.log("fusion: " + JSON.stringify(categories, null, 2));
	return categories;
}