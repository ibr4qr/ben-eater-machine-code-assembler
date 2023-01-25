const fs = require('fs');


// those are opCodes and the list should be returned by the assembler;

var bytes = [0x00, 0xaa, 0xff];

var bu = Buffer.from(bytes);

fs.writeFile("add.bin", bu,  "binary", function(err) { 
    console.log(err);
});
