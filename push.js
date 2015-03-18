var fs = require('fs');
var execSync = require('child_process').execSync;
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
	
	this.buildAndTest = function(path, cb) {
		execSync('(cd ' + path + '; npm i; gulp; npm test)');
		cb(); 
	}

	this.killAndRestart = function(pm2Name, clonePath) {
	
		var starter = 'cd ' + clonePath + '; node start.js;';
		console.log(starter);
	
		execSync('pm2 delete ' + pm2Name);
		execSync(starter); 
	};
	
	this.catch = function(req, pm2Name) {
		var body = req.body;
		
		this.cloneCurrent(req, function(err, clonePath) {
			if(err) {
				throw new Error('Unable to clone');
			}
			
			this.buildAndTest(clonePath, function() {

				//fs.unlinkSync('swanson.log');
				
				this.killAndRestart(pm2Name, clonePath);
				
			}.bind(this));
			
		}.bind(this));
	};
};

module.exports = new constructor();