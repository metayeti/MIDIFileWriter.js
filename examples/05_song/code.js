/*
 *  MIDIFileWriter Song Example
 *
 *  Creates a basic song with predetermined notes.
 *
 */

var song_data = [
	// piano
	['c4 0 24', 'e4 0 24', 'g4 0 24', 'c5 0 24', 'c4 0 24', 'e4 0 24', 'g4 0 24', 'c5 0 24',
	 'a3 0 24', 'c4 0 24', 'e4 0 24', 'a4 0 24', 'a3 0 24', 'c4 0 24', 'e4 0 24', 'a4 0 24',
	 'c4 0 24', 'e4 0 24', 'g4 0 24', 'c5 0 24', 'c4 0 24', 'e4 0 24', 'g4 0 24', 'c5 0 24',
	 'a3 0 24', 'c4 0 24', 'e4 0 24', 'a4 0 24', 'a3 0 24', 'c4 0 24', 'e4 0 24', 'a4 0 24'],
	// bass
	['c4 0 96', 'a3 0 96', 'e4 0 96', 'c4 0 96', 'c4 0 96', 'a3 0 96', 'e4 0 96', 'c4 0 96'],
	// synth
	['c6 0 192', 'e6 0 192', 'g6 0 192', 'e6 0 192']
];
var instruments = [
	'piano',
	'bass',
	'synthpad'
];

function getMIDI() {
	// list of MIDI tracks
	var tracks = [];

	// parse song data
	var n_tracks = song_data.length;
	for (var i = 0; i < n_tracks; i++) {
		// create a MIDI track on channel i
		var track = MIDIfw.createTrack({
			channel: i
		});
		tracks.push(track);
		// add instrument to track
		track.setInstrument({
			time: 0,
			instrument: instruments[i]
		});
		// parse notes
		var notes_data = song_data[i];
		var n_notes = notes_data.length;
		for (var j = 0; j < n_notes; j++) {
			var note_raw = notes_data[j];
			// extract note parts
			var note_parts = note_raw.split(' ');
			var note_name = note_parts[0];
			var note_ontime = parseInt(note_parts[1]);
			var note_offtime = parseInt(note_parts[2]);
			// add note to track
			track.noteOn({
				note: note_name,
				time: note_ontime
			}).noteOff({
				note: note_name,
				time: note_offtime
			});
		}
	}

	// create a MIDI file
	var file = MIDIfw.createFile();
	
	// add all tracks to MIDI file
	file.addTrack.apply(null, tracks);
	
	// retreive a data URI and download as file
	var dataURI = file.getDataURI();
	window.open(dataURI);
}

makemidi.addEventListener('click', getMIDI);
