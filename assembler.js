const fs = require('fs');
const path = require('path');
const os = require('os');

const isWin32 = os.platform() === 'win32';

// TODO: get flags ==> accept --debug ( to log more info while assembling )

const identifiers = {};


// ben eater computer instruction set
const OP_CODES =  {
    NOP: () => [0b0000],
    LDA: () => [0b0001],
    ADD: () => [0b0010],
    SUB: () => [0b0011],
    STA: () => [0b0100], // store registerA value into ram
    LDI: () => [0b0101], // load immediate
    OUT: () => [0b0111], // load only 4 bit value
    JMP: (label) => {
        if(!identifiers[label]) throw new Error(`can't jump to ${label}, ${label} not found`);

        return [0b1000, identifiers[label]]
    },
    HLT: () => [0b1001],
    RET: () => [0b1010],
    END: () => [0b1011],
    CALL: (label) => {
        if(!identifiers[label]) throw new Error(`can't CALL  ${label}, subroutine with label <${label}> not found`);

        return [0b1000, identifiers[label]]
    }
};


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
}

class Cursor {
    x = 1;
    y = 1;
    counter = 0;
    
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

    incrementCounter(points) {
        if(points) this.counter += points;
        if(!points) this.counter++;
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

    getBodyRoutine = (token) => {
        const body = [];
        let line = "";
        let char = "";

        while(true) {
            char = this.assembler._source[this.cursor.counter];
            if(
                char !== '\n' &&
                char !== ' ' && 
                char !== ''
             ) {
                 line+=char;
             } else {
                if(line.startsWith(":") && line.slice(1) === token.identifier) {
                    token.body = body;
                    break;
                } else if(line.length > 0 && !Number.isNaN(+line)) {
                    const token = {
                        type: 'number',
                        value: +line
                    };
                    body.push(token);
                } else if(OP_CODES[line]) {
                    const token = {
                        type: 'opcode', 
                        value: line,
                    }
                    body.push(token);
                }
                 line = "";
             }
            this.cursor.incrementCounter();
        }
    }

    parse = () =>  {
        let line = "";
        const tokens = [];
        let char = "";
        let index = 0;

        // ibr4qr ( we should use only the cursor )
        while(this.cursor.counter < this.assembler._source.length)  {
            char = this.assembler._source[this.cursor.counter];

            if(
               char !== '\n' &&
               char !== ' ' && 
               char !== ''
            ) {
                line+=char;
            } else {
                if(line.startsWith(":")) {
                    let identifer = line.slice(1);
                    
                    identifiers[identifer] ?
                        console.error(`${identifer} already used`) //FIXME: throw a real error here
                        :
                        identifiers[identifer] = index;
                    
                    const token = {
                        type: 'label',
                        identifier: line.slice(1),
                        body: []
                    };
                    this.getBodyRoutine(token);
                    tokens.push(token);
                } else if(line.length > 0 && !Number.isNaN(+line)) {
                    const token = {
                        type: 'number',
                        value: +line
                    };
                    tokens.push(token);
                } else if(OP_CODES[line]) {
                    const token = {
                        type: 'opcode', 
                        value: line,
                    }
                    tokens.push(token);
                }
                line = "";
                index++;
            }
            this.cursor.incrementCounter();
        }

        return tokens;
    }
}

class Parser {
    tokens = [];
    counter = 0;
    byteCode = [];

    constructor(tokens) {
        this.tokens = tokens;
        console.log(this.tokens);
    }


    parse() {
        while(this.counter < this.tokens.length) {
            const token = this.tokens[this.counter];

            switch(token.type) {
                case 'opcode':
                    const byteCode = this.walk_OPCODE(token);
                    this.byteCode.push(...byteCode);
                    break;
                case 'number':
                    break;
                case 'label':
                    const bodyCode = this.walk_IDENTIFER(token);
                    this.byteCode.push(...bodyCode);
                    break;
                default:
                    throw new Error(`${token.value} not expected`)
                
            }


            this.counter++;
        }

        console.log(this.byteCode);
    }

    walk_OPCODE(token, counter) {
        console.log("WALK_OP_CODE: ", token);
        let opcodeValue = token.value;
        let args = 0;

        switch(opcodeValue) {
            case "NOP"  :
            case "OUT"  :
            case "RET"  :
            case "HLT"  :
                    args = 0;
                    break;
            case "LDA"  :
            case "ADD"  :
            case "STA"  :
            case "JUMP" :
            case "CALL" :
            case "SUB"  :
                    args = 1;
                    break;
        }
        
        const c = counter ? counter.id : this.counter;

        const byteCode = [];
        const argTokens = this.tokens.slice(c, c + args + 1);
        // FIXME: here we should redefine all stuff
        byteCode.push(...OP_CODES[opcodeValue]());

        argTokens.forEach((token) => {
            switch(token.type) {
                // ...
                case 'number':
                    byteCode.push(token.value);
            }
        })

        if(counter) {
            counter.in += args;
            console.log("counter.in");
        } else {
            console.log("this.counter");
            this.counter += args;
        }

        return byteCode;
    }

    walk_IDENTIFER(token) {
        // this label has return ?
        const{ identifier, body } = token;
        const isRoutine = body.findIndex(t => t.type === 'opcode' && t.value === 'RET') >= 0;
        const counter = {
            in: 0
        };
        const btCode = [];

        while(counter.in < body.length) {
            const t = body[counter.in]
            switch(t.type) {
                case 'opcode':
                    const byteCode = this.walk_OPCODE(t, counter);
                    btCode.push(...byteCode);
                    break;
                case 'number':
                    break;
                case 'label':
                    throw new Error("inner identifiers not supported");
                default:
                    throw new Error(`${token.value} not expected`)
                
            }
            counter.in++;
        }


        return btCode;  
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
        this.assemble(pathName);
    }

    static readContent(pathName)  {
         let fileContent = fs.readFileSync(path.resolve(__dirname, pathName), 'ascii');
          fileContent += '\n';
         this._source = fileContent;
    }

    static assemble(pathName) {
       try {
        let outputFileName = pathName.split('/')[pathName.split('/').length - 1];
        outputFileName = outputFileName.replace('asm', 'bin');
        const lexer = new Lexer(this);
        const tokens = lexer.parse();
        const parser = new Parser(tokens);
        const byteCode = parser.parse();
        // console.log("byteCode: ", byteCode);
        // const buffer = Buffer.from(byteCode);

        // fs.writeFile(outputFileName, buffer,  "binary", function(err) { 
        //     console.log(err);       
        // });
       } catch(err) {
        console.log(err.message);
       }

    }
}

Assemble.run();