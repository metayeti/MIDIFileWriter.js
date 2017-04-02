## MIDIFileWriter

This is a lightweight library providing a quick and dirty way to create MIDI files on the fly within the browser.

The API is straightforward to use:

```javascript
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
// note can either be a valid MIDI note number or a string representing the note
// you can add an octave number to the string, e.g. 'c4', 'c#4'
// default octave is 5
//
// velocity is a value in range 1 to 127 and isn't required for noteOff
track.noteOn({
	time: 0,
	note: 'c',
	velocity: 127 // optional (default=64)
});
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
```

To change instruments:

```javascript
// set an instrument and then add multiple notes to the track by chaining event calls
//
// instrument can either be a valid MIDI instrument number or a string representing the instrument
// optionally, you can add an instrument variation in range 1 to 8 (for example, 'piano2' or 'guitar7')
// default variation is 1
track.setInstrument({
	time: 0,
	instrument: 'chrome'
});
```

Event calls are chainable:

```
track.noteOn({
	time: 0,
	note: 'c#5',
	velocity: 127
}).noteOff({
	time: 96,
	note: 'c#5'
});
```

Valid instruments are: piano, chrome, organ, guitar, bass, string, ensemble, brass, reed, pipe, synthlead, synthpad, synthfx, ethnic, percussive, sfx.

It is possible to create multitrack MIDI files. The export will be a [Format 1 MIDI file](http://www.music.mcgill.ca/~ich/classes/mumt306/StandardMIDIfileformat.html#BM2_2). The library automatically picks between Format 0 for single-tracked files and Format 1 for multi-tracked. Each track must use a separate channel in order for notes to be played simultaneously:

```javascript
// create a MIDI track on channel 0
// channel is a value in range 0 to 15
var track1 = MIDIfw.createTrack({
	channel: 0
});

// set the instrument and add some notes
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
	channel: 1
});
// set the instrument and add some notes
track2.setInstrument({
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
```

To retreive MIDI data, use one of the following:

```javascript
file.getBytes(); // returns MIDI file in form of a byte array
file.getBase64(); // returns MIDI file in form of a Base64 string
file.getDataURI(); // returns MIDI file in form of a DataURI
```

## License

Copyright (c) 2017 Danijel Durakovic

MIT License