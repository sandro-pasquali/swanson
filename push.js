var exec = require('child_process').exec;
var npm = require('npm');
var bunyan = require('bunyan');

//	This runs independently of the parent.
//
process.disconnect();

var log = bunyan.createLogger({
	name: 'autopilot-log',
	streams: [{
		path: '/.swanson/output.log',
		type: 'file'
	}]
});

//	0 : clone_path
//	1 : clone_url
//	2 : pm2Name
//
var args = process.argv.slice(2);

log.info("ARGS TO FOLLOW");
log.info(args);


var build = 'gulp; npm test;  npm start';

log.info(command);

exec('git clone ' + args[1] + ' ' + args[0] + ';npm i; gulp; npm test; pm2 delete ' + args[2], function() {
	npm.load(function(err) {
		npm.commands.start(function (err, data) {
			log.info('Restart completed');
			process.exit(0);
		});
	});
});