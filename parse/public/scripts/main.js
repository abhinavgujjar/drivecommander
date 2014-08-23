/*global define*/

'use strict';

define(['js/underscore', 'js/jquery', 'term', 'gdrive', 'mousewheel'], function(_, $, _term, gdrive) {

	gdrive.ready().then(function() {
		$('body').terminal(processor, {
			greetings: 'Welcome to your google command line interface',
			prompt: '>',
			name: 'test'
		});
	});

	var DIR_TYPE = 'application/vnd.google-apps.folder';


	var rootFolder = {
		id: 'root',
		title : 'root'
	};
	var currentFolder = rootFolder;
	var currentFiles = [];

	var folderStack = [rootFolder];



	function processor(command, term) {
		if (command == 'askreddit') {
			term.push(askReddit, {
				greetings: 'Hottest on AskReddit right now...',
				name: 'askreddit',
				prompt: 'askReddit> '
			});

		} else if (command == 'drive') {
			term.echo('signing in...');

			term.pause();
			gdrive.signIn().then(function() {
				term.echo('signed in. you are ready to go');
				term.resume();

				term.push(drive, {
					name: 'drive',
					prompt: 'root$ '
				});
			});

		} else {
			term.echo('unknown command');
		}

	}

	function drive(command, term) {

		var parsedCommand = $.terminal.parseCommand(command);

		if (command === 'ls') {

			term.pause();
			gdrive.getFiles(currentFolder.id).then(function(files) {
				var index = 1;
				currentFiles = [];
				var display = '<div class="row">';

				_.each(files, function(item) {
					currentFiles.push({
						__id: String(index),
						file: item
					});

					var prefix = '';
					var prefixClass = '';

					if (item.mimeType === DIR_TYPE){
						prefix = '/';
						 prefixClass = 'text-success';
					}


					display = display + '<div class="col-md-4 ' + prefixClass + ' ">' + index + '   ' + prefix + item.title + '</div>';



					index++;
				});

				display = display + '</div>';
				term.echo(display, {
					raw: true
				});

				term.resume();

			});

		} else if (parsedCommand.name === 'cd') {

			if (!parsedCommand.args || !parsedCommand.args[0]) {
				term.echo('you need to provide a directory number');
			} else {

				var id = parsedCommand.args[0];

				if (id === '..') {

					setDirectory(folderStack.pop(), term);

					return;
				}

				var targetDir = _.find(currentFiles, function(item) {
					return String(id) === item.__id;
				});

				if (targetDir.file.mimeType === 'application/vnd.google-apps.folder') {

					folderStack.push(currentFolder);

					setDirectory(targetDir.file, term);


				} else {
					term.error('not a folder');
				}

			}


		} else {
			var targetFile = _.find(currentFiles, function(item) {
				return command === item.__id;
			});

			if (targetFile) {
				if (targetFile.file.defaultOpenWithLink) {
					window.open(targetFile.file.defaultOpenWithLink);
				} else {
					term.echo('no default program found to open this file');
				}

			} else {
				term.echo(command + ' : command not found');
			}
		}
	}

	function setDirectory(dir, term) {

		if ( !dir ){
			dir = rootFolder;
		}

		currentFolder = dir;

		term.set_prompt(dir.title + '$ ');

	}

	function askReddit(command, term) {
		if (command === 'hot') {
			term.pause();
			$.ajax('http://www.reddit.com/r/AskReddit/.json').done(function(response) {
				var index = 1;
				_.each(response.data.children, function(item) {
					term.echo(index + ') ' + item.data.title);
					index++;
				});

				term.resume();
			});
		}

	}

});