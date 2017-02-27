/*
 *  MIDIFileWriter basic example
 *
 *  Creates a MIDI file with some notes and saves it using a data URI.
 *
 */

function getMIDI() {
	// create track
	var track = MIDIfw.createTrack();
	
	// set tempo and instrument
	track.setTempo(60);
	track.setInstrument(1);
	
	// add some note events
	track.addTrackEvent({
		type: 'noteOn',
		data: 64
	});
	
	// create the midi file and add a track to it
	var file = MIDIfw.createFile();
	//file.addTrack(track);
	
	console.log(file.getBytes());
	console.log(file.getBase64());
	console.log(file.getDataURI());
	
	// pass the data URI
	//var dataURI = file.getDataURI();
	
	// open the data URI
	//window.open("data:text/html," + dataURI, "_blank", "width=100,height=100");
}

makemidi.addEventListener('click', getMIDI);
