@echo off
set "outfile=dist\midifilewriter.min.js"
uglifyjs src\midifilewriter.js --compress --mangle --screw-ie8 -o %outfile%.tmp | more
type header.txt > %outfile%
type %outfile%.tmp >> %outfile%
del %outfile%.tmp