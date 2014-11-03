var Howl = require('../../bower_components/howler/howler.min').Howl;
var names = ['bell', 'bass', 'aha', 'snap', 'flutter', 'bitty'];
var extensions = ['mp3', 'ogg', 'wav'];
var sounds = {};

names.forEach(function (name) {
	var urls = extensions.map(function (ext) {
		return name + '.' + ext;
	});

	sounds[name] = new Howl({
		urls: urls
	});
});

module.exports = sounds;
