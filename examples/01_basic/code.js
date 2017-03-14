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
		instrument: 79
	});
	track.noteOn({
		time: 240,
		note: 51,
		velocity: 127
	});
	track.noteOff({
		time: 58,
		note: 51
	});
	track.noteOn({
		time: 500,
		note: 52,
		velocity: 127
	});
	track.noteOff({
		time: 128,
		note: 52
	});
	/*
	track.noteOn({
		time: 58,
		note: 51,
		velocity: 127
	});
	track.noteOff({
		time: 174,
		note: 51
	});
	track.noteOn({
		time: 300,
		note: 51,
		velocity: 127
	});
	track.noteOff({
		time: 300,
		note: 51
	});
	*/
	
	var file = MIDIfw.createFile({
		tempo: 90,
		ticksPerBeat: 200
	});
	
	file.addTrack(track);
	console.log(file.getDataURI());
	
	/*
	// create track
	var track = MIDIfw.createTrack();
	
	// set tempo and instrument
	//track.setTempo(60);
	//track.setInstrument(1);
	
	// add some note events
	track.addTrackEvent({
		time: 0,
		type: 'noteOn',
		note: 17
	});
	
	track.addTrackEvent({
		time: 15,
		type: 'noteOff',
		note: 17
	});
	
	// create the midi file
	var file = MIDIfw.createFile({
		tempo: 60, // set tempo (optional)
		timeSignature: [4, 4] // set time signature (optional)
	});
	
	// add track to file
	file.addTrack(track);
	
	//console.log(file.getBytes());
	//console.log(file.getBase64());
	console.log(file.getDataURI());
	
	// pass the data URI
	//var dataURI = file.getDataURI();
	
	// open the data URI
	//window.open("data:text/html," + dataURI, "_blank", "width=100,height=100");
	*/
}

makemidi.addEventListener('click', getMIDI);
