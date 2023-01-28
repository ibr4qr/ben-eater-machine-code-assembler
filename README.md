# ben-eater-machine-code-assembler
Simple Ben Eater Assemblee to machine code 

Assemble to machineCode assembler of the Bean-eater 8 bit Computer.

This Project will be coupled with the Bean Eater Virtual Machine.

Should be good any language since we don't need any low level control.

How does it work?

1. Get sourceCode
2. Parse sourceCode
3. Generate Code


Registers available A, B


b.asm

```
LDA 10
ADD 20

OUT
  
```


Example.

```
 node essambler main.asm
```


** TODO:
- get instruction set of the 8 bit Ben Eater Computer (https://www.youtube.com/watch?v=HyznrdDSSGM&list=PLowKtXNTBypGqImE405J2565dvjafglHU)
- Populate the OP_CODES ENUM


output should be byteCode then evaluated by the VM.

