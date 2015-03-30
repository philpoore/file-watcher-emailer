var argv =  require('minimist')(process.argv.slice(2));

var fs = require('fs');
var colors = require('colors');
var readline = require('readline');
var ft = require('file-tail');
var child_process = require('child_process');

// Command Line Arguments
var colNum = argv.c || null;
var delimeter = argv.d || ' ';
var file = argv.f || null;
var regexp = argv.r;
var to = argv.to;
var subject = argv.subject || 'File Watcher Emailer has found a match :)';


if (!to){
	throw new Error("--to [email] required".red);
}

if (!regexp){
	throw new Error("-r [regexp] required".red);
}


regexp = new RegExp(regexp)
// Help Text
if(argv.help || argv.h) {
	var help = "\n======================================================================\n" +
			"File Watcher Emailer is an application that monitors a 'tabular'\n" +
			"text file for a regexp and emails you the results.\n\n" +
			"Usage :\n" +
			"\t./watcher-emailer -f [filename] -r [regexp] --to [email] --subject [subject]\n" +
			"======================================================================\n";

	console.log(help);
	process.exit();
}


if (typeof process.stdin.setRawMode == 'function') {
	process.stdin.setRawMode(true);
}

process.stdin.resume();





function sendEmail(line){
	console.log('sending email'.green, to, subject);
	var mail = child_process.spawn('mail', ['-s', subject, to]);
	mail.stdout.pipe(process.stdout);
	mail.stdin.write("File Watcher Emailer has found a match for :" + regexp + '\n\n');
	mail.stdin.write(line);
	mail.stdin.end();
}

function handleLine(line) {
	console.log(line);

	if (line.match(regexp)){
		console.log('found match'.green, to, subject);
		sendEmail(line);
	}
}

function readFile() {
	ft = ft.startTailing(file);
	console.log('Reading from file: ', file);

	// Monitor 'tail' of file
	ft.on('line', handleLine);

}

function readstdin() {
	console.log('Reading from STDIN: ');

	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout,
	  terminal: false
	});

	rl.on('line', handleLine);
}

if(argv.f) {
	readFile();
} else {
	readstdin();
}