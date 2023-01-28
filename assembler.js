const fs = require('fs');
const path = require('path');

const OP_CODES =  {
    NOP: 0x00,
};

const RT = 112;

class Utility {
    static getProgramName() {
        // FIXME:  platform dependent operation ( what Os are running on?? )
        
        const splitted = process.argv[1].split('\\');
        const name = splitted[splitted.length - 1];
        return name;
    }

    static isAsmFile(fileName) {
        const stuff = fileName.split('.');
        const type = stuff[stuff.length - 1];

        return type === 'asm';
    }
}


class Cursor {
    x = 1;
    y = 1;
    
    constructor(x, y) {
          this.x = x || 1
          this.y = y || 1;
    }

    setCursor(x, y) {
        this.x = x;
        this.y = y;


        if( x <= 0 ) this.x = 1;
        if( y <= 0 ) this.y = 1;
    }

}

class Parser { 
    cursor = null;
    _source = "";
    assembler = null;
    // TODO: we finished parsing when cursor.x * cursor.y === sourceCode.length
    // cursor.x * cursor.y should never be over sourceCode.length
    constructor(assembler) {
        this.cursor = new Cursor();
        this.assembler = assembler;
        console.log(assembler);
    }
    
    getCounter = () => {
        return (this.cursor.x * this.cursor.y) - 1;
    }

    parse = () =>  {
        const sourceCode = this.assembler._source;
        let counter = 0;
        let line = "";
        const lines = [];
        
        while(counter < sourceCode.length)  {
            const char = sourceCode[counter];

            if(char === '\r') {
                if(line.trim().length > 0) lines.push(line);
                line = "";
                counter += 2;
                this.cursor.setCursor(this.cursor.x + 1, 1);
                continue;
            };

            if(line.trim().length > 0 && counter + 1=== sourceCode.length) {
                lines.push(line);
                line = "";
                break;
            }

            // console.log(this.cursor)
            line += char;
            this.cursor.setCursor(this.cursor.x, this.cursor.y + 1);
            counter++;
        }

        return lines;
    }
}


class Assemble {
    _line = 0;
    _source = "";

    static run() {
        const name = Utility.getProgramName();

        if(process.argv.length < 3) {
            console.log(`Usage: ${name} <path> | <list of path>`);
            return;
        }




        const filesToAssemble = process.argv.slice(2);
            
        filesToAssemble.forEach(f => {
            if(!Utility.isAsmFile(f)) {
                console.log("Ignoring ", f, "since it s not a asm file");
                return;
            }

            this.init(f);
        });
    }

    static init(pathName) {
        this.readContent(pathName);
        this.assemble();
    }

    static readContent(pathName)  {
         const fileContent = fs.readFileSync(path.resolve(__dirname, pathName), 'ascii');
         this._source = fileContent;
    }

    static assemble() {
        // here we should get all tokens
        // example add ax 10 ==> ["add", "ax", "10"]
        const parser = new Parser(this);
        const tokens = parser.parse();
        console.log(tokens);
    }
}

Assemble.run();


// TODO:
// those are opCodes and the list should be returned by the assembler;
/**
 * generate machine code
 */
// var bytes = [0x00, 0xaa, 0xff];

// var bu = Buffer.from(bytes);

// fs.writeFile("add.bin", bu,  "binary", function(err) { 
//     console.log(err);
// });
