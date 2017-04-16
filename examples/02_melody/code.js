/*
 *  MIDIFileWriter Melody Example
 *
 *  Creates several MIDI notes by chaining noteOn and noteOff events.
 *
 */
 
function getMIDI() {
	// create a MIDI track
	var track = MIDIfw.createTrack();
	
	// set an instrument and then add multiple notes to the track by chaining event calls
	//
	// instrument can either be a valid MIDI instrument number or a string representing the instrument
	// instruments to pick from are: piano, chrome, organ, guitar, bass, string, ensemble, brass, reed,
	// pipe, synthlead, synthpad, synthfx, ethnic, percussive, sfx
	//
	// optionally, you can add an instrument variation in range 1 to 8 (for example, 'piano2' or 'guitar7')
	// default variation is 1
	track.setInstrument({
		time: 0,
		instrument: 'chrome'
	}).noteOn({
		time: 0,
		note: 'c4',
		velocity: 127
	}).noteOff({
		time: 24,
		note: 'c4'
	}).noteOn({
		time: 0,
		note: 'f4',
		velocity: 127
	}).noteOff({
		time: 24,
		note: 'f4'
	}).noteOn({
		time: 0,
		note: 'a4',
		velocity: 127
	}).noteOff({
		time: 24,
		note: 'a4'
	}).noteOn({
		time: 0,
		note: 'c5',
		velocity: 127
	}).noteOff({
		time: 96,
		note: 'c5'
	});
	
	// create a MIDI file
	var file = MIDIfw.createFile();
	
	// add track to MIDI file
	file.addTrack(track);
	
	// retreive a data URI and download as file
	var dataURI = file.getDataURI();
	window.open(dataURI);
}

makemidi.addEventListener('click', getMIDI);
