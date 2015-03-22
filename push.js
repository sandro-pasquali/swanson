var path = require('path');
var exec = require('child_process').exec;
var bunyan = require('bunyan');

process.disconnect();

var log = bunyan.createLogger({
	name: 'swanson-log',
	streams: [{
		path: '/.swanson/output.log',
		type: 'file'
	}]
});

//	0 : clone_path
//	1 : clone_url
//	2 : pm2Name
//	3 : commit data
//
var args = process.argv.slice(2);

//	The github repo clone url
//
var cloneUrl = args[1];

//	The pm2 process name; === to the npm main file (the entry point for repo)
var pm2Name = args[2];

//	The directory of the repo that is being watched
//
var sourceDir = path.dirname(args[2]);

//	The directory in which test clones are pulled and tested
//
var buildDir = args[0];

//	What was removed, modified or added
//
var commits = JSON.parse(args[3]);

function cloneRepo(cb) {
	exec('git clone ' + cloneUrl + ' ' + buildDir, cb);
}

function enterAndBuild(cb) {
	exec('cd ' + buildDir + ';npm i; gulp;npm test', cb);
}

//	Run through the buildDir and move all files/folders that 
function moveAndRestart(cb) {

	var removing = commits.removed;
	//	Both modified and added
	//
	var adding = commits.modified.concat(commits.added);
	
	var removeCommands = [];
	var addCommands = [];
	var command = [];
	
	//	remove commands are simple rm's
	//	add || modify we rm from source, and replace with newly built files
	//
	removing.forEach(function(f) {
		removeCommands.push(
			'rm -rf ' + sourceDir + '/' + f
		);
	});
	
	adding.forEach(function(f) {
		addCommands.push(
			'rm -rf ' + sourceDir + '/' + f,
			'mv ' + buildDir + '/' + f + ' ' + sourceDir + '/' + f
		);
	});
	
	//	Just creating a long string of ;-separated commands for #exec
	//
	removeCommands.length && command.push(removeCommands.join(';'));
	addCommands.length && command.push(addCommands.join(';'));
	command.push('pm2 restart ' + pm2Name);
	command = command.join(';');
	
	console.log(command);
	
	//exec(command, cb);
}

		moveAndRestart(function(err) {
			if(err) {
				return log.error(err);
			}
			console.log("OK!!!!!!!!!");
		});

/*

cloneRepo(function(err) {
	if(err) {
		//	do some more here
		return log.error(err);
	}
	enterAndBuild(function(err, data) {
		if(err) {
			return log.error(err);
		}
		moveAndRestart(function(err) {
			if(err) {
				return log.error(err);
			}
			console.log("OK!!!!!!!!!");
		});
	});
});

*/

/*
var command = 'git clone ' + args[1] + ' ' + buildDir + ';cd ' + buildDir + ';npm i; gulp;npm test; rm -rf ' + sourceDir + '/build; mv ' + buildDir + '/build ' + sourceDir + ';pm2 restart ' + args[2];

exec(command, function() {
	log.info('restart complete');
	process.exit(0);
});
*/
