const fs = require('fs');
const path = require('path');


const OP_CODES =  {
    NOP: 0x00,
};

class Utility {
    static getProgramName() {
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
        for(let i = 0; i < this._source.length; i++) {}
    }
}


Assemble.run();