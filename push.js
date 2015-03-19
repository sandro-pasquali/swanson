var fs = require('fs');
var execSync = require('child_process').execSync;
var fork = require('child_process').fork;
var pm2 = require('pm2');
var mkdirp = require('mkdirp');

var constructor = function() {

	this.cloneCurrent = function(req, cb) {
		var body = req.body;
		var prev = body.before;
		var curr = body.after;
		var cloning = body.repository.clone_url;
		
		execSync('git clone ' + cloning + ' /.swanson/' + curr);
		
		console.log("CLONED IS DONE");
		cb(null, '/.swanson/' + curr);
	};
	
	this.buildAndTest = function(clonePath, pm2Name) {
		execSync('cd ' + clonePath + '; npm i; gulp; npm test; pm2 delete ' + pm2Name + '; npm start;');
		cb(); 
	}
	
	this.catch = function(req, pm2Name) {
		var body = req.body;
		
		this.cloneCurrent(req, function(err, clonePath) {
			if(err) {
				throw new Error('Unable to clone');
			}
			
			this.restart(clonePath, pm2Name);
			
		}.bind(this));
	};
};

module.exports = new constructor();