/*
 *  MIDIFileWriter basic example
 *
 *  Creates a MIDI file with multiple tracks and saves it using a data URI.
 *
 */
 
function getMIDI() {
	var track1 = MIDIfw.createTrack({
		channel: 0
	});
	
	track1.setInstrument({
		time: 0,
		instrument: 3
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 127
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 90
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 127
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 90
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
		track1.noteOn({
		time: 0,
		note: 50,
		velocity: 127
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 90
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 127
	});
	track1.noteOff({
		time: 24,
		note: 50
	});
	track1.noteOn({
		time: 0,
		note: 50,
		velocity: 90
	});
	track1.noteOff({
		time: 96,
		note: 50
	});
	
	var track2 = MIDIfw.createTrack({
		channel: 1
	});
	
	track2.setInstrument({
		time: 0,
		instrument: 9
	});
	track2.noteOn({
		time: 0,
		note: 62,
		velocity: 127
	});
	track2.noteOff({
		time: 96,
		note: 62
	});
	track2.noteOn({
		time: 0,
		note: 55,
		velocity: 127
	});
	track2.noteOff({
		time: 96,
		note: 55
	});
	track2.noteOn({
		time: 0,
		note: 57,
		velocity: 127
	});
	track2.noteOff({
		time: 96,
		note: 57
	});
	
	
	var file = MIDIfw.createFile({
		tempo: 60, // optional tempo
		ticksPerBeat: 96 // optional division
	});
	
	file.addTrack(track1);
	file.addTrack(track2);
	
	window.open(file.getDataURI());
}

makemidi.addEventListener('click', getMIDI);
