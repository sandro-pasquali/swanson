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
//
var args = process.argv.slice(2);

var sourceDir = path.dirname(args[2]);
var buildDir = args[0];

var command = 'git clone ' + args[1] + ' ' + buildDir + ';cd ' + buildDir + ';npm i; gulp;npm test; rm -rf ' + sourceDir + '; mv ' + buildDir + ' ' + sourceDir + ';pm2 restart ' + args[2];

exec(command, function() {
	log.info('restart complete');
	process.exit(0);
});

