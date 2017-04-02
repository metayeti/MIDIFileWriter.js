/*
 *  MIDIFileWriter Stair Example
 *
 *  Generates a MIDI file that cycles through a range of notes.
 *
 */
 
function getMIDI() {
	// create a MIDI track
	var track = MIDIfw.createTrack();
	
	// select instrument
	track.setInstrument({
		time: 0,
		instrument: 'synthlead8'
	})
	
	// note range
	var note_from = 30;
	var note_to = 80;
	var n_repeats = 3;
	
	// repeat notes from range repeatedly
	for (var i = 0; i < n_repeats; i++) {
		for (var note_n = note_from; note_n <= note_to; note_n++) {
			var off_time = (note_n == note_to) ? 192 : 12; // hold last note
			track.noteOn({
				time: 0,
				note: note_n
			}).noteOff({
				time: off_time,
				note: note_n
			});
		}
	}
	
	// create a MIDI file with track
	var file = MIDIfw.createFile({ tempo: 190 }).addTrack(track);
	
	// retreive a data URI and download as file
	var dataURI = file.getDataURI();
	window.open(dataURI);
}

makemidi.addEventListener('click', getMIDI);
