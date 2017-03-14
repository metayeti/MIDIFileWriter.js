/*
 *  MIDIFileWriter basic example
 *
 *  Creates a MIDI file with some notes and saves it using a data URI.
 *
 */
 
function getMIDI() {
	var track = MIDIfw.createTrack();
	
	track.setInstrument({
		time: 0,
		instrument: 3
	});
	track.noteOn({
		time: 0,
		note: 50,
		velocity: 127
	});
	track.noteOff({
		time: 24,
		note: 50
	});
	track.noteOn({
		time: 0,
		note: 56,
		velocity: 127
	});
	track.noteOff({
		time: 24,
		note: 56
	});
		track.noteOn({
		time: 0,
		note: 60,
		velocity: 127
	});
	track.noteOff({
		time: 96,
		note: 60
	});
	
	
	var file = MIDIfw.createFile({
		tempo: 90, // optional tempo
		ticksPerBeat: 96 // optional division
	});
	
	file.addTrack(track);
	window.open(file.getDataURI());
}

makemidi.addEventListener('click', getMIDI);
