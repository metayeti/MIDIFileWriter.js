/*
 *  MIDIFileWriter Multitrack Example
 *
 *  Creates a multi-track (format 1) MIDI file.
 *
 */
 
function getMIDI() {

	// create a MIDI track on channel 0
	var track1 = MIDIfw.createTrack({
		channel: 0
	});

	// select the instrument and add some notes
	track1.setInstrument({
		time: 0,
		instrument: 'guitar'
	}).noteOn({
		time: 0,
		note: 'c'
	}).noteOff({
		time: 24,
		note: 'c'
	}).noteOn({
		time: 0,
		note: 'c'
	}).noteOff({
		time: 96,
		note: 'c'
	});

	// create another MIDI track on channel 1
	var track2 = MIDIfw.createTrack({
		time: 0,
		instrument: 'bass'
	}).noteOn({
		time: 0,
		note: 'c3'
	}).noteOff({
		time: 96,
		note: 'c3'
	});

	// create a MIDI file
	var file = MIDIfw.createFile();
	
	// you can use addTrack (or addTracks) with any number of arguments to add multiple tracks
	file.addTracks(track1, track2);
	
	// retreive a data URI and download as file
	var dataURI = file.getDataURI();
	window.open(dataURI);
}

makemidi.addEventListener('click', getMIDI);
