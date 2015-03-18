var fs = require('fs');
var exec = require('child_process').exec;
var pm2 = require('pm2');
var mkdirp = require('mkdirp');

var constructor = function() {

	this.cloneCurrent = function(req, cb) {
		var body = req.body;
		var prev = body.before;
		var curr = body.after;
		var cloning = body.repository.clone_url;
		
		exec('git clone ' + cloning + ' /.swanson/' + curr, function(err) {
			if(err) {
				return cb(err);
			}
			console.log("CLONED IS DONE");
			cb(null, '/.swanson/' + curr);
		});
	};
	
	this.buildAndTest = function(path, cb) {
		console.log(path);
		exec('(cd ' + path + '; npm i; gulp; npm test)', cb); 
	}

	this.killAndRestart = function(pm2Name, clonePath) {
		pm2.connect(function() {
			pm2.describe(pm2Name, function(err, list) {
				list.forEach(function(obj) {
					exec('pm2 delete ' + obj.pm_id, function() {
						console.log(obj.pm_id + ' - deleted');
						fs.unlinkSync('swanson.log');
						exec('(cd ' + clonePath + '; node start.js)', function(err) {
							if(err) {
								throw new Error("Could not restart process");
							}
						}); 
					});
				});
			});
		});
	};
	
	this.catch = function(req, pm2Name) {
		var body = req.body;
		
		this.cloneCurrent(req, function(err, clonePath) {
			if(err) {
				this.killProcess(pm2Name);
			}
			
			this.buildAndTest(clonePath, function(err) {
				if(err) {
					throw new Error("New repo not production ready!");
				}
				
				this.killAndRestart(pm2Name, clonePath);
			}.bind(this));
			
		}.bind(this));
	};
};

module.exports = new constructor();