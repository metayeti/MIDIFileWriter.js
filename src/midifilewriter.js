/*
 *  MIDIFileWriter
 *
 *  0.8.0
 *
 *  (c) 2017 Danijel Durakovic
 *  MIT license
 *
 */

var MIDIfw = (function() { "use strict";

	//
	//  constants
	// 
	var HEADER_CHUNK_TYPE = [0x4d, 0x54, 0x68, 0x64]; // MThd
	var HEADER_CHUNK_LENGTH = [0x00, 0x00, 0x00, 0x06];
	var HEADER_CHUNK_FORMAT0 = [0x00, 0x00];
	var HEADER_CHUNK_FORMAT1 = [0x00, 0x01];
	var TRACK_CHUNK_TYPE = [0x4d, 0x54, 0x72, 0x6b]; // MTrk
	var MESSAGE_NOTEON_PREFIX = 0x90;
	var MESSAGE_NOTEOFF_PREFIX = 0x80;
	var MESSAGE_PROGRAMCHANGE_PREFIX = 0xc0;
	var META_EVENT_PREFIX = 0xff;
	var META_EVENT_END = 0x2f;
	var META_EVENT_TIMESIG = 0x58;
	var META_EVENT_TEMPO = 0x51;
	var META_TIMESIG_CC = 0x18; // 24 MIDI clocks per quarter note
	var META_TIMESIG_BB = 0x08; // 8 1/32nds per quarter note (quarternote per quarternote)
	var DEFAULT_CHANNEL = 0;
	var DEFAULT_VELOCITY = 64;
	var DEFAULT_TICKSPERBEAT = 96;
	var DEFAULT_TEMPO = 60;
	var DEFAULT_NUMERATOR = 4;
	var DEFAULT_DENOMINATOR = 4;
	var MAX_CHANNEL = 15;
	var MAX_NOTE = 127;
	var MAX_VELOCITY = 127;
	var MAX_TICKSPERBEAT = 65535;
	var DATAURI_PREFIX = 'data:audio/midi;base64,';
	var NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
	
	//
	//  helper functions
	//
	function toBytes(number, byteCount) {
		var bytes = new Array(byteCount);
		for (var i = byteCount - 1; i >= 0; i--) {
			bytes[i] = number & 255;
			number >>= 8;
		}
		return bytes;
	}

	function toVarLenBytes(number) {
		var bytes = [];
		var last = true;
		do {
			var partial_value = number & 127;
			number >>= 7;
			if (last) {
				// first bit is off for last byte
				bytes.unshift(partial_value);
				last = false;
			}
			else {
				// set first bit on for all other bytes
				bytes.unshift(partial_value | 128);
			}
		} while (number > 0);
		return bytes;
	}

	function toBase64(byteArray) {
		var len = byteArray.byteLength;
		var data = '';
		for (var i = 0; i < len; i++) {
			data += String.fromCharCode(byteArray[i]);
		}
		return btoa(data);
	}

	//
	//  MIDI Event classes
	//
	var MIDIEvent = {
		note: function(time, channel, type, note, velocity) {
			this.getBytes = function() {
				var bytes = toVarLenBytes(time);
				var status = channel | ((type) ? MESSAGE_NOTEOFF_PREFIX : MESSAGE_NOTEON_PREFIX);
				bytes.push(status, note, velocity);
				return bytes;
			};
		},
		programChange: function(time, channel, program) {
			this.getBytes = function() {
				var bytes = toVarLenBytes(time);
				var status = channel | MESSAGE_PROGRAMCHANGE_PREFIX;
				bytes.push(status, program);
				return bytes;
			};
		},
		meta: function(type, data) {
			this.getBytes = function() {
				data = data || [];
				var time = 0;
				var bytes = toVarLenBytes(time);
				bytes.push(META_EVENT_PREFIX, type);
				bytes = bytes.concat(toVarLenBytes(data.length));
				bytes = bytes.concat(data);
				return bytes;
			};
		}
	};

	//
	//  MIDI Track class
	//
	function MIDITrack(properties) {
		var channel = (properties && properties.channel && properties.channel >= 0 && properties.channel <= MAX_CHANNEL)
			? properties.channel
			: DEFAULT_CHANNEL;

		var eventList = [];

		function parseNote(rawnote) {
			if (typeof rawnote === 'string') {
				var noteName;
				var octave = 5;
				var hasOctave = false;
				if (rawnote.length > 1) {
					var octaveStr = rawnote[rawnote.length - 1];
					if (!isNaN(octaveStr)) {
						octave = parseInt(octaveStr);
						hasOctave = true;
					}
				}
				noteName = (hasOctave)
					? rawnote.slice(0, properties.note.length - 1)
					: rawnote
				return NOTE_NAMES.indexOf(noteName.toLowerCase()) % 12 + 12 * octave;	
			}
			return rawnote;
		}

		// public functions
		this.setInstrument = function(properties) {
			if (properties !== undefined && properties.instrument !== undefined) {
				var time = properties.time || 0;
				var program = properties.instrument;
				var e = new MIDIEvent.programChange(time, channel, program);
				eventList.push(e);
			}
			return this;
		};
		this.noteOn = function(properties) {
			if (properties !== undefined && properties.time !== undefined && properties.note !== undefined) {
				var time = properties.time;
				var type = 0; // note ON
				var note = parseNote(properties.note);
				var velocity = properties.velocity || DEFAULT_VELOCITY;
				if (note >= 0 && note <= MAX_NOTE && velocity >= 0 && velocity <= MAX_VELOCITY) {
					var e = new MIDIEvent.note(time, channel, type, note, velocity);
					eventList.push(e);
				}
			}
			return this;
		};
		this.noteOff = function(properties) {
			if (properties !== undefined && properties.time !== undefined && properties.note !== undefined) {
				var time = properties.time;
				var note = parseNote(properties.note);
				var type = 1; // note OFF
				var velocity = 0;
				if (note >= 0 && note <= MAX_NOTE) {
					var e = new MIDIEvent.note(time, channel, type, note, velocity);
					eventList.push(e);
				}
			}
			return this;
		};
		this.getBytes = function(metaEvents) {
			var bytes = TRACK_CHUNK_TYPE;
			var eventBytes = [];
			var i;
			// if we have meta events, add those prior to note data
			if (metaEvents instanceof Array) {
				var n_metaEvents = metaEvents.length;
				for (i = 0; i < n_metaEvents; i++) {
					eventBytes = eventBytes.concat(metaEvents[i].getBytes());
				}
			}
			// get event bytes
			var n_events = eventList.length;
			for (i = 0; i < n_events; i++) {
				eventBytes = eventBytes.concat(eventList[i].getBytes());
			}
			// end of track event
			var endEvent = new MIDIEvent.meta(META_EVENT_END);
			eventBytes = eventBytes.concat(endEvent.getBytes());
			// track length
			bytes = bytes.concat(toBytes(eventBytes.length, 4));
			// finalize and return bytes
			bytes = bytes.concat(eventBytes);
			return bytes;
		};
	}

	//
	//  MIDI File class
	//
	function MIDIFile(properties) {
		var tpb = (properties && properties.ticksPerBeat && properties.ticksPerBeat > 0 && properties.ticksPerBeat <= MAX_TICKSPERBEAT)
			? properties.ticksPerBeat
			: DEFAULT_TICKSPERBEAT;
		var tempo = (properties && properties.tempo && properties.tempo > 0)
			? properties.tempo
			: DEFAULT_TEMPO;
		var timeSig = (properties && properties.timeSignature instanceof Array && properties.timeSignature.length === 2)
			? [properties.timeSignature[0], properties.timeSignature[1]]
			: [DEFAULT_NUMERATOR, DEFAULT_DENOMINATOR];

		var trackList = [];

		function getHeader() {
			var n_tracks = trackList.length;
			var n_all_tracks = (n_tracks > 1) ? n_tracks + 1 : n_tracks;
			var bytes = HEADER_CHUNK_TYPE;
			bytes = bytes.concat(HEADER_CHUNK_LENGTH);
			bytes = bytes.concat((n_tracks > 1) ? HEADER_CHUNK_FORMAT1 : HEADER_CHUNK_FORMAT0);
			bytes = bytes.concat(toBytes(n_all_tracks, 2));
			bytes = bytes.concat(toBytes(tpb, 2));
			return bytes;
		}
		function getTimeSigAndTempoMeta() {
			var numerator = timeSig[0];
			var denominator = timeSig[1];
			if (denominator === 0 || denominator & (denominator - 1)) {
				denominator = 4; // back to default if not power of 2
			}
			var timeSigData = toBytes(numerator, 1);
			timeSigData = timeSigData.concat(toBytes(Math.log2(denominator), 1));
			timeSigData.push(META_TIMESIG_CC, META_TIMESIG_BB);
			var timeSigEvent = new MIDIEvent.meta(META_EVENT_TIMESIG, timeSigData);
			var tempoData = toBytes(Math.floor(6e7 / tempo), 3);
			var tempoEvent = new MIDIEvent.meta(META_EVENT_TEMPO, tempoData);
			return [timeSigEvent, tempoEvent];
		}
		function buildFile() {
			var n_tracks = trackList.length;
			var bytes = getHeader();
			// create time signature and tempo meta events
			var metaEvents = getTimeSigAndTempoMeta();
			// format 1 MIDI, add a meta track with time signature and tempo data
			if (n_tracks > 1) {
				var metaTrack = new MIDITrack();
				// add meta track bytes
				bytes = bytes.concat(metaTrack.getBytes(metaEvents));
			}
			// add track data
			for (var i = 0; i < n_tracks; i++) {
				var track = trackList[i];
				var trackBytes = (n_tracks === 1 && i === 0)
					? track.getBytes(metaEvents) // format 0 MIDI, add time signature and tempo data
					: track.getBytes();
				bytes = bytes.concat(trackBytes);
			}
			return bytes;
		}

		// public functions
		this.addTrack = function(track) {
			trackList.push(track);
			return this;
		};
		this.getBytes = function() {
			return new Uint8Array(buildFile());
		};
		this.getBase64 = function() {
			return toBase64(this.getBytes());
		};
		this.getDataURI = function() {
			return DATAURI_PREFIX + this.getBase64();
		};
	}

	//
	// public API
	//
	return {
		createTrack: function(properties) {
			return new MIDITrack(properties);
		},
		createFile: function(properties) {
			return new MIDIFile(properties);
		}
	};

}());
