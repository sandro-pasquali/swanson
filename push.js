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
			cb(null, './swanson/' + curr);
		});
	};
	
	this.buildAndTest = function(path) {
		exec('(cd ' + path + '; npm i; gulp; npm test)', function(err) {
			console.log("BUILDTEST", err);
		}); 
	}

	this.killProcess = function(name, cb) {
		pm2.connect(function() {
			pm2.describe(pm2Name, function(err, list) {
				list.forEach(function(obj) {
					exec('pm2 delete ' + obj.pm_id, function() {
						console.log(obj.pm_id + ' - deleted');
						fs.unlinkSync('swanson.log');
						
						cb && cb();
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
			
			this.buildAndTest(clonePath);
			
		}.bind(this));
		
		//this.killProcess(pm2Name);
		
	};
};

module.exports = new constructor();

/*
var clone = require("./").Clone.clone;

// Clone a given repository into a specific folder.
clone("https://github.com/nodegit/nodegit", "tmp", null)
  // Look up this known commit.
  .then(function(repo) {
    // Use a known commit sha from this repository.
    return repo.getCommit("59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5");
  })
  // Look up a specific file within that commit.
  .then(function(commit) {
    return commit.getEntry("README.md");
  })
  // Get the blob contents from the file.
  .then(function(entry) {
    // Patch the blob to contain a reference to the entry.
    return entry.getBlob().then(function(blob) {
      blob.entry = entry;
      return blob;
    });
  })
  // Display information about the blob.
  .then(function(blob) {
    // Show the name, sha, and filesize in byes.
    console.log(blob.entry.name() + blob.entry.sha() + blob.size() + "b");

    // Show a spacer.
    console.log(Array(72).join("=") + "\n\n");

    // Show the entire file.
    console.log(String(blob));
  })
  .catch(function(err) { console.log(err); });
*/