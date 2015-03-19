var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
var fork = require('child_process').fork;
var pm2 = require('pm2');
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');
var jsop = require('jsop');

function swansonHandler(req, res) {

	if(req.get('X-Github-Event') === "push") {
		fork('./push.js', [
			req.body.before,
			req.body.after,
			req.body.repository.clone_url
		], {});
	}
	
	res.send('ok');
}

module.exports = function(app) {
	
	if(!app) {
		throw new Error("No Express app sent");
	}
	
	//	...create /.swanson dir if not in existence
	//
	mkdirp.sync('/.swanson');

	var log = jsop('swanson.log');	
	var script = process.argv[1];	

	if(!script) {
		throw new Error("Unable to fetch info on location of server script");
	}
	
	app.post('/swanson', swansonHandler.bind({
		pm2Name : script
	}));
	
	if(~script.indexOf('/pm2/') || log[script]) {
		return;
	}
	
	log[script] = new Date().getTime();

	exec("pm2 start " + script + " --name='" + script + "'", function(err) {

		if(err) {
			throw new Error(err);
		}
		
		//	Kill this process; pm2 is now running it.
		//
		console.log("Swanson now running 'tings; try > pm2 list " + script + " to get an index to your running server cluster");
		
		process.exit(0);
	});
};