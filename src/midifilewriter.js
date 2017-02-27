/*
 *  MIDIFileWriter
 *
 *  (c) 2017 Danijel Durakovic
 *  MIT License
 * 
 */
var MIDIfw = (function() {
	// constants
	var HEADER_CHUNK_TYPE = [0x4d, 0x54, 0x68, 0x64]; // MThd
	var HEADER_CHUNK_LENGTH = [0x00, 0x00, 0x00, 0x06];
	var HEADER_CHUNK_FORMAT0 = [0x00, 0x00];
	var HEADER_CHUNK_FORMAT1 = [0x00, 0x01];
	var TRACK_CHUNK_TYPE = [0x4d, 0x54, 0x72, 0x6b]; // MTrk
	var META_EVENT_PREFIX = [0xff];
	var META_EVENT_END = [0x2f];
	var META_EVENT_TEMPO = [0x51];
	var META_EVENT_TIMESIG = [0x58];
	var DATAURI_PREFIX = 'data:audio/midi;base64,';

	// variables
	var tpb = 96; // ticks per beat (default=96)

	// helpers
	function toBytes(number, byteCount) {
		var bytes = new Array(byteCount);
		for (var i = byteCount - 1; i >= 0; i--) {
			bytes[i] = number & 255;
			number >>= 8;
		}
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
	//  track event class
	//
	function TrackEvent() {
		this.getBytes = function() {
		};
	}

	//
	//  meta event class
	//
	function MetaEvent() {
		this.getBytes = function() {
		};
	}

	//
	//  track class
	//
	function Track() {
		var eventList = [];

		// exposed functions
		this.setTempo = function(tempo) {
		};
		this.setInstrument = function(id) {
		};
		this.addTrackEvent = function(properties) {
		};
		this.addMetaEvent = function(properties) {
		};
		this.getBytes = function() {
			var bytes = TRACK_CHUNK_TYPE;
			var eventBytes = [];
			// get event bytes
			var events_n = eventList.length;
			for (var i = 0; i < events_n; i++) {
				eventBytes = eventBytes.concat(eventBytes[i].getBytes());
			}
			// finalize and return track bytes
			bytes = bytes.concat(toBytes(eventBytes.length, 4));
			bytes = bytes.concat(eventBytes);
			return bytes;
		};
	}

	//
	//  file class
	//
	function File(properties) {
		if (properties && properties.ticksPerBeat && properties.ticksPerBeat > 0)
			tpb = properties.ticksPerBeat;

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
			if (n_tracks > 0) {
				for (var i = 0; i < n_tracks; i++) {
					var track = trackList[i];
					bytes = bytes.concat(track.getBytes());
				}
			}
			return bytes;
		}

		// exposed functions
		this.addTrack = function(track) {
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
