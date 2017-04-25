
'use strict';

require( 'dotenv' ).config( {silent: true} );

var express = require('express')  // app server
, app = express()
, bodyParser = require( 'body-parser' );  // parser for post requests

app.use(bodyParser.json());
app.use( express.static( './public' ) ); // load UI from public folder

var path = require('path');
global.appRoot = path.resolve(__dirname);

// Use a querystring parser to encode output.
var qs = require('qs');
var rq = require('request');
var fs = require('fs');

var async = require('async');
var multer  = require('multer');
var uploadTest = multer({ dest: './temp/tests/' });

// Watson Developer Cloud sdk
var watson = require( 'watson-developer-cloud' );


// Orchestrator domain & endpoints declared on the .env file
var domain = process.env.API_DOMAIN;
var authEndpoint = process.env.AUTHENTICATION;
var convEndpoint = process.env.CONVERSATION;
var testEndpoint = process.env.TESTUNIT;
var userAuthEndpoint = process.env.USER_AUTH;


var _23hours = 23 * 60 * 60 * 1000;	// orchestrator's token validity in hours (max 24hrs)
var auth_token;

// Request new toekn from the orchestrator's server
var auth = function() {
	var payload = {
		app_ID: process.env.API_USER,
		password: process.env.API_PASS
	};
	var options = {
		url: domain + authEndpoint,
		form: payload,
	};

	rq.post(options, function (err, response, body) {
		if (err) {
			console.log("Error auth: " + err);
		} else {
			body = JSON.parse(body);
			if(body.success) {
				auth_token = body.token;
			}	else {
				console.log("Error auth: wrong user/password");
			}
		}
	});
}
auth();
setInterval(auth, _23hours);


// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

  var payload = {};

  if (req.body) {
    payload.user_input = req.body.user_input;
	payload.client_ID = req.body.client_ID;
	payload.admin_tag = req.body.admin_tag || false;
	if(req.body.conversation_ID)
		payload.conversation_ID = req.body.conversation_ID;
  }

	var options = {
		url: domain + convEndpoint,
		form: payload,
		headers: {
    	'x-access-token': auth_token
		}
	}

  rq.post(options, function (err, response, body) {
		if (err) {
			return res.status(err.code || 500).json(err);
		} else {
			return res.json(JSON.parse(body));
		}
  });
});


// Endpoint to call for users authentification
app.get('/auth/check', function(req, res) {
	var usr = req.query.usrID;
	var psw = req.query.pswID;
	var role = req.query.role;
	
	var options = {
		url: domain + userAuthEndpoint,
		headers: {
		'x-access-token': auth_token
		},
		form: {
			user_ID: req.query.usrID,
			password: req.query.pswID,
			role: req.query.role
		}
	};
	console.log(options)
	
	rq.post(options, function (err, response, body) {
		if (err) {
			res.status(500).send(err);
		} else {
			if(JSON.parse(body).success) {
				res.json(1);
			} else {
				res.json(0);
			}
		}
	});
});

function B64DecodeUni(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}


// Uploads a test file
app.post('/test/launch', function(req, res, next){
  if (!req.body) {
    return next({
      error: 'Missing required parameter: file',
      code: 400
    });
  }
  else{
	  analyseTestFile(req.body, function(err, response){
		  if(err){
			  console.log(err);
		  } else {
			  res.json(response); 
		  };
	  });
  };
});


var analyseTestFile = function(elm, callback){
	var arrValue = elm.arrValue;
	var testRes = {
			ok: 0,
			ko: 0,
			ok_low: 0,
			ko_low: 0,
			ok_choice_1: 0,
			ok_choice_2: 0,
			ko_choice_1: 0,
			ko_choice_2: 0,
			total: 0
	};
	
	var confTriggers = {
			high : elm.triggers.high,
			medium : elm.triggers.medium,
			low : elm.triggers.low
	};
	
	async.map(arrValue, sendTestValue.bind(null, confTriggers), function(err, result){		
		for(var i=0; i<result.length; i++){
			testRes[result[i]]++;
		}
		testRes.total = result.length;
		
		callback(null, testRes);
	})	
};

var sendTestValue = function(confTriggers, item, callback){
	var result = '';
	
	var options = {
		url: domain + testEndpoint,
		form: {
			input: item[0]
		},
		headers: {
    	'x-access-token': auth_token
		}
	}
	
	rq.post(options, function (err, response, body) {
		if (err) {
			console.log(err);
		} else {
			var parsedRes = JSON.parse(body);

			if (!parsedRes.intents) {
				console.log("Missing: Conversation's intents");
			} 
			else if (parsedRes.intents && parsedRes.intents[0]) {
				// Check for OK
				if ((parsedRes.intents[0].confidence >= confTriggers.high)&&(item[1] == parsedRes.intents[0].intent)) result = 'ok';
				// Check for OK_Choice_1
				else if ((parsedRes.intents[0].confidence + parsedRes.intents[1].confidence >= confTriggers.medium)&&(item[1] == parsedRes.intents[0].intent || item[1] == parsedRes.intents[1].intent)) result = 'ok_choice_1';
				//Check for OK_Choice_2
				else if ((parsedRes.intents[0].confidence + parsedRes.intents[1].confidence + parsedRes.intents[2].confidence >= confTriggers.low)&&(item[1] == parsedRes.intents[0].intent || item[1] == parsedRes.intents[1].intent || item[1] == parsedRes.intents[2].intent)) result = 'ok_choice_2'; 
				//Check for KO
				else if ((parsedRes.intents[0].confidence >= confTriggers.high)&&(item[1] != parsedRes.intents[0].intent)) result = 'ko';
				// Check for KO_Choice_1
				else if ((parsedRes.intents[0].confidence + parsedRes.intents[1].confidence >= confTriggers.medium)&&(item[1] != parsedRes.intents[0].intent && item[1] != parsedRes.intents[1].intent)) result = 'ko_choice_1';						
				// Check for KO_Choice_2
				else if ((parsedRes.intents[0].confidence + parsedRes.intents[1].confidence + parsedRes.intents[2].confidence >= confTriggers.low)&&(item[1] != parsedRes.intents[0].intent && item[1] != parsedRes.intents[1].intent && item[1] != parsedRes.intents[2].intent)) result = 'ko_choice_2';						
				//Check for KO Low
				else if ((item[1] != parsedRes.intents[0].intent))  result = 'ko_low';
				//Check for OK Low
				else {
					result = 'ok_low';
				};
			};
		};	
		
		callback(null, result);
	});	
}

module.exports = app;
