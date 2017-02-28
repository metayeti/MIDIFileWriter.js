/*
 *  MIDIFileWriter
 *
 *  (c) 2017 Danijel Durakovic
 *  MIT License
 * 
 */
var MIDIfw = (function() { "use strict";
	// constants
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
	var DEFAULT_CHANNEL = 0;
	var DEFAULT_VELOCITY = 64;
	var DEFAULT_TICKSPERBEAT = 96;
	var DEFAULT_TEMPO = 60;
	var DEFAULT_NUMERATOR = 4;
	var DEFAULT_DENOMINATOR = 4;
	var DATAURI_PREFIX = 'data:audio/midi;base64,';

	// global data
	var tempo;
	var timesig;

	// helpers
	function toBytes(number, byteCount) {
		var bytes = new Array(byteCount);
		for (var i = byteCount - 1; i >= 0; i--) {
			bytes[i] = number & 255;
			number >>= 8;
		}
		return bytes;
	}

	function toVarLengthBytes(number) {
		var bytes = [];
		var first = true;
		do {
			var partial_value = number & 127;
			number >>= 7;
			if (first) {
				// first bit is off for last byte
				bytes.unshift(partial_value);
				first = false;
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
	//  event classes
	//
	function NoteEvent(time, channel, type, note, velocity) {
		this.getBytes = function() {
			var bytes = toVarLengthBytes(time);
			var status = channel | ((type) ? MESSAGE_NOTEOFF_PREFIX : MESSAGE_NOTEON_PREFIX);
			bytes.push(status, note, velocity);
			return bytes;
		};
	}

	function ProgramChangeEvent(time, channel, program) {
		this.getBytes = function() {
			var bytes = toVarLengthBytes(time);
			var status = channel | MESSAGE_PROGRAMCHANGE_PREFIX;
			bytes.push(status, program);
			return bytes;
		};
	}

	function MetaEvent(type, data) {
		this.getBytes = function() {
			data = data || [];
			var time = 0;
			var bytes = toVarLengthBytes(time);
			bytes.push(META_EVENT_PREFIX);
			bytes.push(type);
			bytes = bytes.concat(toVarLengthBytes(data.length));
			bytes = bytes.concat(data);
			return bytes;
		};
	}

	//
	//  track class
	//
	function Track() {
		var eventList = [];

		this.id = null; // track ID

		// exposed functions
		/*
		this.addTrackEvent = function(properties) {
			if (properties && properties.type && properties.note) {
				var time = properties.time || 0;
				var channel = properties.channel || DEFAULT_CHANNEL;
				var note = properties.note;
				var type, velocity;
				switch (properties.type.toLowerCase()) { 
					case 'noteon':
						type = 0;
						velocity = properties.velocity || DEFAULT_VELOCITY;
						break;
					case 'noteoff':
						type = 1;
						velocity = 0;
						break;
					default: // not a valid event type
						return;
				}
				if (channel >= 0 && channel <= 15 &&
					note >= 0 && note <= 127 &&
					velocity >= 0 && velocity <= 127) {

					var noteEvent = new NoteEvent(time, channel, type, note, velocity);
					eventList.push(noteEvent);
				}
			}
		};
		this.addMetaEvent = function(properties) {
		};
		*/
		this.setInstrument = function(properties) {
			if (properties !== undefined &&
				properties.id !== undefined) {

				var time = properties.time || 0;
				var channel = properties.channel || DEFAULT_CHANNEL;
				var program = properties.id;
				var programChangeEvent = new ProgramChangeEvent(time, channel, program);
				eventList.push(programChangeEvent);
			}
		};
		this.noteOn = function(properties) {
			if (properties !== undefined &&
				properties.time !== undefined &&
				properties.note !== undefined) {

				var time = properties.time;
				var channel = properties.channel || DEFAULT_CHANNEL;
				var type = 0;
				var note = properties.note;
				var velocity = properties.velocity || DEFAULT_VELOCITY;
				if (channel >= 0 && channel <= 15 &&
					note >= 0 && note <= 127 &&
					velocity >= 0 && velocity <= 127) {

					var noteEvent = new NoteEvent(time, channel, type, note, velocity);
					eventList.push(noteEvent);
				}
			}
		};
		this.noteOff = function(properties) {
			if (properties !== undefined &&
				properties.time !== undefined &&
				properties.note !== undefined) {

				var time = properties.time;
				var channel = properties.channel || DEFAULT_CHANNEL;
				var note = properties.note;
				var type = 1;
				var velocity = 0;
				if (channel >= 0 && channel <= 15 &&
					note >= 0 && note <= 127) {

					var noteEvent = new NoteEvent(time, channel, type, note, velocity);
					eventList.push(noteEvent);
				}
			}
		};
		this.getBytes = function() {
			var bytes = TRACK_CHUNK_TYPE;
			var eventBytes = [];
			// get event bytes
			if (this.id === 0) {
				// first track
				// add time signature event
				var timeSigData = [0x04, 0x02, 0x18, 0x08];
				var timeSigEvent = new MetaEvent(META_EVENT_TIMESIG, timeSigData);
				// add tempo event
				var tempoData = [0x08, 0x7a, 0x23];
				var tempoEvent = new MetaEvent(META_EVENT_TEMPO, tempoData);
			}
			var events_n = eventList.length;
			for (var i = 0; i < events_n; i++) {
				eventBytes = eventBytes.concat(eventList[i].getBytes());
			}
			// add end of track event
			var endEvent = new MetaEvent(META_EVENT_END);
			eventBytes = eventBytes.concat(endEvent.getBytes());
			// finalize and return track bytes
			bytes = bytes.concat(toBytes(eventBytes.length, 4));
			// add user defined event bytes
			bytes = bytes.concat(eventBytes);
			return bytes;
		};
	}

	//
	//  file class
	//
	function File(properties) {
		var tpb = (properties && properties.ticksPerBeat && properties.ticksPerBeat > 0 && properties.ticksPerBeat <= 65535)
			? properties.ticksPerBeat
			: DEFAULT_TICKSPERBEAT;

		tempo = (properties && properties.tempo && properties.tempo > 0)
			? properties.tempo
			: DEFAULT_TEMPO;

		timesig = (properties && properties.timeSignature instanceof Array && properties.timeSignature.length === 2)
			? [properties.timeSignature[0], properties.timeSignature[1]]
			: [DEFAULT_NUMERATOR, DEFAULT_DENOMINATOR];

		var trackList = [];

		function getHeaderChunk() {
			var bytes;
			var n_tracks = trackList.length;
			bytes = HEADER_CHUNK_TYPE;
			bytes = bytes.concat(HEADER_CHUNK_LENGTH);
			bytes = bytes.concat((n_tracks > 1) ? HEADER_CHUNK_FORMAT1 : HEADER_CHUNK_FORMAT0);
			bytes = bytes.concat(toBytes(n_tracks, 2));
			bytes = bytes.concat(toBytes(tpb, 2));
			return bytes;
		}
		function buildFile() {
			var bytes = getHeaderChunk();
			var n_tracks = trackList.length;
			for (var i = 0; i < n_tracks; i++) {
				var track = trackList[i];
				bytes = bytes.concat(track.getBytes());
			}
			return bytes;
		}

		// exposed functions
		this.addTrack = function(track) {
			track.id = trackList.length;
			trackList.push(track);
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

	// public API
	return {
		createTrack: function() {
			return new Track();
		},
		createFile: function(properties) {
			return new File(properties);
		}
	};
}());
