/*
 *  MIDIFileWriter Basic Example
 *
 *  Creates a MIDI file with a single note and saves it using a data URI.
 *
 */
 
function getMIDI() {
	// create a MIDI track
	var track = MIDIfw.createTrack();
	
	// add a single note to the track
	//
	// time represents delta time from the last event
	// an eighth note is given by ticksPerBeat/8 = 96/8 = 12,
	// a quarter note would be ticksPerBeat/4 = 96/4 = 24,
	// a half note would be ticksPerBeat/2 = 96/2 = 48
	// a whole note then is simply ticksPerBeat/1 = 96/1 = 96
	//
	// note can either be an valid MIDI note number or a string representing the note
	// you can add an octave number to the string, e.g. 'c4', 'c#4'
	// default octave is 5
	//
	// velocity is a value from 1 to 127, not required for noteOff
	track.noteOn({
		time: 0,
		note: 'c',
		velocity: 127 // optional (default=64)
	})
	track.noteOff({
		time: 96,
		note: 'c'
	});
	
	// create a MIDI file
	// all parameters are optional with defaults as specified below
	var file = MIDIfw.createFile({
		tempo: 60, // optional (default=60)
		ticksPerBeat: 96, // optional (default=96)
		timeSignature: [4,4] // optional (default=[4,4])
	});
	
	// add track to MIDI file
	file.addTrack(track);
	
	// retreive a data URI and download as file
	var dataURI = file.getDataURI();
	window.open(dataURI);
}

makemidi.addEventListener('click', getMIDI);
