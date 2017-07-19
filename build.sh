#!/bin/bash
INFILE=src/midifilewriter.js
OUTFILE=dist/midifilewriter.min.js
uglifyjs $INFILE --compress --mangle --screw-ie8 -o $OUTFILE.tmp
cat header.txt > $OUTFILE
cat $OUTFILE.tmp >> $OUTFILE
rm $OUTFILE.tmp
