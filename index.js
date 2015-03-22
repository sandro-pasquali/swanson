var fs = require('fs');
var path = require('path');
var util = require('util');
var exec = require('child_process').exec;
var fork = require('child_process').fork;
var pm2 = require('pm2');
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');
var del = require('del');
var jsop = require('jsop');
var bunyan = require('bunyan');

var log = bunyan.createLogger({
	name: 'autopilot-log',
	streams: [{
		path: '/.swanson/output.log',
		type: 'file'
	}]
});

function swansonHandler(req, res) {
	var swansonPath = path.resolve('./node_modules/swanson');
	log.info("Swansonpath: " + swansonPath);
	if(req.get('X-Github-Event') === "push") {
		var cwd = '/.swanson/' + req.body.after;
		fork(swansonPath + '/push.js', [
			cwd,
			req.body.repository.clone_url,
			this.pm2Name
		], {
			cwd: cwd
		});
	}
	
	res.send('ok');
}

module.exports = function(app) {
	
	if(!app) {
		throw new Error("No Express app sent");
	}
	
	var script = process.argv[1];	
	
	if(!script) {
		throw new Error("Unable to fetch info on location of server script");
	}
	
	//	...create /.swanson dir if not in existence
	//
	mkdirp.sync('/.swanson');

	var scratch = jsop('./swanson.log');
			
	app.post('/swanson', swansonHandler.bind({
		pm2Name : script
	}));			
			
	if(~script.indexOf('/pm2/') || scratch[script]) {
		return;
	}
	
	scratch[script] = new Date().getTime();
		
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