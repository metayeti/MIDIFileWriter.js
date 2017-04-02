/*
 *  MIDIFileWriter Chords Example
 *
 *  Creates a few chords.
 *
 */
 
function getMIDI() {
	// create a MIDI track and add an instrument
	var track = MIDIfw.createTrack().setInstrument({ time: 0, instrument: 'piano' });

	// to create chords, add events for multiple noteOn events and then close with noteOff
	track.noteOn({
		time: 0,
		note: 'c4'
	}).noteOn({
		time: 0,
		note: 'e4'
	}).noteOn({
		time: 0,
		note: 'g4'
	}).noteOff({
		time: 192,  // time where chord ends
		note: 'c4'
	}).noteOff({
		time: 0,    // close other notes at same time
		note: 'e4'
	}).noteOff({
		time: 0,    // ...
		note: 'g4'
	});	

	track.noteOn({
		time: 96,   // time where chord starts
		note: 'd4'
	}).noteOn({
		time: 0,    // open other notes at the same time
		note: 'f4'
	}).noteOn({
		time: 0,    // ...
		note: 'a4'
	}).noteOff({
		time: 192,
		note: 'd4'
	}).noteOff({
		time: 0,
		note: 'f4'
	}).noteOff({
		time: 0,
		note: 'a4'
	});
		
	// create a MIDI file
	var file = MIDIfw.createFile().addTrack(track);
	
	// retreive a data URI and download as file
	var dataURI = file.getDataURI();
	window.open(dataURI);
}

makemidi.addEventListener('click', getMIDI);
