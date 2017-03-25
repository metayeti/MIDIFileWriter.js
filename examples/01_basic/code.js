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
	}).noteOn({
		time: 0,
		note: 'c#',
		velocity: 127
	}).noteOff({
		time: 24,
		note: 'C#'
	}).noteOn({
		time: 0,
		note: 'd',
		velocity: 127
	}).noteOff({
		time: 24,
		note: 'd'
	}).noteOn({
		time: 0,
		note: 'e',
		velocity: 127
	}).noteOff({
		time: 96,
		note: 'e'
	});
	
	var file = MIDIfw.createFile({
		tempo: 90, // optional (default=60)
		ticksPerBeat: 96, // optional (default=96)
		timeSignature: [4,4] // optional (default=[4,4])
	});
	
	file.addTrack(track);
	//console.log(file.getBase64());
	
	window.open(file.getDataURI());
}

makemidi.addEventListener('click', getMIDI);
