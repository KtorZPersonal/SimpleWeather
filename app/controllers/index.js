/* Just some error messages */
var MESSAGES = {
	geolocationUnavailable: "Can't find your current location :'(",
	placefinderFailure: "Oops, the address seems to be invalid !",
	weatherFailure: "Failed to retrieve details about the weather :(",
	loading: "Fetching data, please wait..."
};

/* Icons corresponding to codes, according to the Yahoo API*/
var ICONS = {
	0: "/weatherIcons/storm.png", 	// 	tornado
	1: "/weatherIcons/storm.png", 	// 	tropical storm
	2: "/weatherIcons/storm.png",	//	hurricane
	3: "/weatherIcons/storm.png",	//	severe thunderstorms
	4: "/weatherIcons/storm.png",	//	thunderstorms
	5: "/weatherIcons/hugeRain.png",	//	mixed rain and snow
	6: "/weatherIcons/hugeRain.png",	//	mixed rain and sleet
	7: "/weatherIcons/hugeRain.png",	//	mixed snow and sleet
	8: "/weatherIcons/rain.png",		//	freezing drizzle
	9: "/weatherIcons/rain.png",		//	drizzle
	10: "/weatherIcons/rain.png",	//	freezing rain
	11: "/weatherIcons/hugeRain.png",//	showers
	12: "/weatherIcons/hugeRain.png",//	showers
	13: "/weatherIcons/snow.png",	//	snow flurries
	14: "/weatherIcons/snow.png",	//	light snow showers
	15: "/weatherIcons/snow.png",	//	blowing snow
	16: "/weatherIcons/snow.png",	//	snow
	17: "/weatherIcons/hugeRain.png",//	hail
	18: "/weatherIcons/hugeRain.png",//	sleet
	19: "/weatherIcons/mist.png",	//	dust
	20: "/weatherIcons/mist.png",	//	foggy
	21: "/weatherIcons/mist.png",	//	haze
	22: "/weatherIcons/mist.png",	//	smoky
	23: "/weatherIcons/smallWind.png",//	blustery
	24: "/weatherIcons/smallWind.png",//	windy
	25: "/weatherIcons/smallWind.png",//	cold
	26: "/weatherIcons/cloud.png",	//	cloudy
	27: "/weatherIcons/cloud.png",	//	mostly cloudy (night)
	28: "/weatherIcons/cloud.png",	//	mostly cloudy (day)
	29: "/weatherIcons/cloud.png",	//	partly cloudy (night)
	30: "/weatherIcons/cloud.png",	//	partly cloudy (day)
	31: "/weatherIcons/sun.png",		//	clear (night)
	32: "/weatherIcons/sun.png",		//	sunny
	33: "/weatherIcons/sun.png",		//	fair (night)
	34: "/weatherIcons/sun.png",		//	fair (day)
	35: "/weatherIcons/cloudy.png",	//	mixed rain and hail
	36: "/weatherIcons/sun.png",		//	hot
	37: "/weatherIcons/storm.png",	//	isolated thunderstorms
	38: "/weatherIcons/storm.png",	//	scattered thunderstorms
	39: "/weatherIcons/storm.png",	//	scattered thunderstorms
	40: "/weatherIcons/rain.png",	//	scattered showers
	41: "/weatherIcons/snow.png",	//	heavy snow
	42: "/weatherIcons/snow.png",	//	scattered snow showers
	43: "/weatherIcons/snow.png",	//	heavy snow
	44: "/weatherIcons/cloud.png",	//	partly cloudy
	45: "/weatherIcons/storm.png",	//	thundershowers
	46: "/weatherIcons/snow.png",	//	snow showers
	47: "/weatherIcons/storm.png",	//	isolated thundershowers
	3200: "" 					// unavailable
};

/* Reset all labels */
function resetFields() {
	$.title.text = "";
	$.date.text = "";
	$.conditions.text = "";
	$.currentIcon.image = "";
	for(var i = 1; i <= 3; i++) {
		$['after'+i].children[0].text = "";
		$['after'+i].children[1].text = "";
		$['after'+i].children[2].image = "";
		$['after'+i].children[3].text = "";
	}
}

/* Update weater details inside labels */
function updateDetails(details) {
	var formatTemp = function(temp) {
		return temp + "°" + details.units.temperature;
	};
	$.title.text = details.location.city + ", " + details.location.country;
	$.date.text = details.lastBuildDate;
	$.conditions.text = details.item.condition.text + ", " + formatTemp(details.item.condition.temp);
	$.currentIcon.image = ICONS[details.item.condition.code];
	
	/* Also inform about some forecast */
	var fc;
	for(var i = 1; i <= 3; i++) {
		fc = details.item.forecast[i];
		$['after'+i].children[0].text = fc.day;
		$['after'+i].children[1].text = formatTemp(fc.low) + " | " + formatTemp(fc.high);
		$['after'+i].children[2].image = ICONS[fc.code];
		$['after'+i].children[3].text = fc.text;
	}
}

/* Retrieve weather details from gps coordinate or address */
function weatherDetails(query, callback) {
	/* Firstly, retrieve the woeid from either gps coordinate or city name */
	Titanium.Yahoo.yql("SELECT woeid FROM geo.placefinder WHERE text='" + query + "' and gflags='R'", function(res){
		if(!res.success) return callback(MESSAGES.placefinderFailure);
		
		/* Little hack to get the woeid.. dunno why.. the api send back either an object, or an array of objects :/ */
		var woeid = res.data.Result;
		woeid = woeid.length > 0 ? woeid[0].woeid : woeid.woeid;
		
		/* Then, access weather details for this location */
		Titanium.Yahoo.yql("SELECT * FROM weather.forecast WHERE u='c' AND woeid=" + woeid, function(weather){
			if(!weather.success) return callback(MESSAGES.weatherFailure);
			return callback(null, weather.data.channel);
		});
	});
}

/* Change details and get weather about another address */
function updateLocation() {
	resetFields();
	$.conditions.text = MESSAGES.loading;
	weatherDetails($.address.value, function(err, details) {
		if(err) $.conditions.text = err;
		else updateDetails(details);
	});
}

/* When Starting, display weather about the current location, if possible */
Titanium.Geolocation.getCurrentPosition(function(e) {
	if(e == null || !e.success || e.error) {
		$.conditions.text = MESSAGES.geolocationUnavailable;
		$.index.open();
		return;
	}
	var queryText = e.coords.latitude + "," + e.coords.longitude;
	weatherDetails(queryText, function(err, details) {
		if(err) $.conditions.text = err;
		else updateDetails(details);
		$.index.open();
	});
});
