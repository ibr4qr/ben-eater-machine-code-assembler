const fs = require('fs');
const path = require('path');
const os = require('os');

const isWin32 = os.platform() === 'win32';

// ben eater computer instruction set
const OP_CODES =  {
    NOP: 0b0000,
    LDA: 0b0001,
    ADD: 0b0010,
    SUB: 0b0011,
    STA: 0b0100, // store registerA value into ram
    LDI: 0b0101, // load immediate
    OUT: 0b1110, // load only 4 bit value
    JMP: 0b0110,
    
    HLT: 0b1111
};

// maybe I should delete this for know ( i handle in a really bad way different pathTypes )
const RT = 112;
const NL = 10;



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

    static isDebugMode() {
        return typeof v8debug === 'object' 
        || /--debug|--inspect/.test(process.execArgv.join(' '))
    }

    /**
     * 
     * @param { string } pattern 
     * @returns { boolean } 
     */
    static isFlag(pattern) {
        const regex = /^--\w+$/;
        return regex.test(pattern);
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

    getCounter() {
        return this.x * this.y - 1;
    }

}

class Lexer { 
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
        

        // ibr4qr ( we should use only the cursor )
        while(counter < sourceCode.length && this.cursor.getCounter() < sourceCode.length)  {
            

            const char = sourceCode[counter];
            
            if(isWin32) {
                if(char === '\r') {
                    if(line.trim().length > 0) lines.push(line);
                    line = "";
                    counter += 2;
                    this.cursor.setCursor(this.cursor.x + 1, 1);
                    continue;
                };
    
                if(line.trim().length > 0 && counter + 1 === sourceCode.length) {
                    lines.push(line);
                    line = "";
                    break;
                }
    
                // console.log(this.cursor)
                line += char;
                this.cursor.setCursor(this.cursor.x, this.cursor.y + 1);
                counter++;
            } else {



                if(sourceCode[this.cursor.getCounter()] === '\n') {
                    this.cursor.setCursor(this.cursor.x + 1, 1);
                    lines.push(line);
                    line = "";
                    continue;
                }

                line += sourceCode[this.cursor.getCounter()];
                this.cursor.setCursor(this.cursor.x, this.cursor.y + 1);
            }

           
        }

        return lines;
    }
}

class Parser {
    lines = [];
    constructor(lines) {
        this.lines = lines;
    }


    parse() {
        const byteCode = [];
        // do cool stuff
        Array.isArray(this.lines) && this.lines.forEach(line => {
            const tokens = line.split(' ');
            tokens.forEach(token => {
                if(!Number.isNaN(+token)) {

                    // if +token > 2**4 - 1 throw an error
                    
                    byteCode.push(+token);
                    return;
                }
                byteCode.push(OP_CODES[token])
            });

        });

        return byteCode;
    }

}


class Assemble {
    _line = 0;
    _source = "";
    _isDebugMode = null; // --debug
    _isProfileMode = null; // --profile

    _flags = {
        debug: '--debug',
        profile: '--profile',
        help: '--help',
        version: '--version'
    };

    static run() {
        const isDebugging = Utility.isDebugMode();

        
        // gather all flags
        const flags = process.argv.slice(2).filter(arg => {
            return Utility.isFlag(arg);
        });

        flags.forEach(flag => {
            switch(flag.trim()) {
                case this._flags.debug:
                        console.log("---- we are in debugging mode ----");
                        break;
                case this._flags.profile:
                        console.log("---- we are in profiling mode  ----");
                        break;
                default:
                        console.log(flag + " was not expected a flags hence will be ignored...");
            }
        })

        const name = Utility.getProgramName();

        if(process.argv.length < 3) {
            console.log(`Usage: ${name} <path> | <list of path>`);
            return;
        }

        const filesToAssemble = process.argv.slice(2);
            
        filesToAssemble.forEach(f => {
            if(!Utility.isAsmFile(f)) {
                console.log("Ignoring ", f, "since it's not a asm file");
                return;
            }

            this.init(f);
        });
    }

    static init(pathName) {
        this.readContent(pathName);
        this.assemble(pathName);
    }

    static readContent(pathName)  {
         const fileContent = fs.readFileSync(path.resolve(__dirname, pathName), 'ascii');
         this._source = fileContent;
    }

    static assemble(pathName) {
        let outputFileName = pathName.split('/')[pathName.split('/').length - 1];
        outputFileName = outputFileName.replace('asm', 'bin');
        const lexer = new Lexer(this);
        const lines = lexer.parse();
        // const mockedLines = ['LDA 20', 'OUT'];
        console.log("lines: ", lines);
        const parser = new Parser(lines);
        const byteCode = parser.parse();
        console.log("byteCode: ", byteCode);
        const buffer = Buffer.from(byteCode);

        fs.writeFile(outputFileName, buffer,  "binary", function(err) { 
            console.log(err);       
        });

    }
}

Assemble.run();