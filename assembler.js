const fs = require('fs');
const path = require('path');

const OP_CODES =  {
    NOP: 0x00,
};

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
    
    

}

class Parser { 
    cursor = null;
    // TODO: we finished parsing when cursor.x * cursor.y === sourceCode.length
    // cursor.x * cursor.y should never be over sourceCode.length
    constructor() {
        this.cursor = new Cursor();
    }
    
      getCounter = () => {
        return (this.cursor.x * this.cursor.y) - 1;
    }
}


class Assemble {
    _line = 0;
    _source = "";

    static run() {
        console.log(process.argv);
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
        const parser = new Parser();
        
        do {
            // get tokens
        } while(parser.cursor.getCounter() < this._source.length)
    }
}


Assemble.run();
