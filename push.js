var exec = require('child_process').exec;
var bunyan = require('bunyan');

var log = bunyan.createLogger({
	name: 'autopilot-log',
	streams: [{
		path: '/.swanson/output.log',
		type: 'file'
	}]
});

//	0 : before (prev commit hash)
//	1 : after (curr commit hash)
//	2 : clone_url
//	3 : pm2Name
//
var args = process.argv.slice(2);

log.info("ARGS TO FOLLOW");
log.info(args);

var clonePath = '/.swanson/' + args[1];
var command = 'git clone ' + args[2] + ' ' + clonePath + ';cd ' + clonePath + '; npm i; gulp; npm test; pm2 delete ' + args[3] + '; npm start';

log.info(command);

exec(command);

log.info('Restart completed');