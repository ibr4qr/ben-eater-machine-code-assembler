# ben-eater-machine-code-assembler
Simple Ben Eater Assemblee to machine code 

Assemble to machineCode assembler of the Bean-eater 8 bit Computer.

This Project will be coupled with the Bean Eater Virtual Machine ( https://github.com/ibr4qr/ben-eater-VM ).

Should be good any language since we don't need any low level control.

How does it work?

1. Get sourceCode
2. Parse sourceCode
3. Generate Code


Registers available A, B


b.bs

```
LDA 10
ADD 20

OUT
  
```


```
  node assembler --usage
```

```
  node assembler <filePath> | <folder> | <Array<filePath>>
```



Example.

```
 node essambler main.bs
```


**TODO:
- get instruction set of the 8 bit Ben Eater Computer (https://www.youtube.com/watch?v=HyznrdDSSGM&list=PLowKtXNTBypGqImE405J2565dvjafglHU)
- Populate the OP_CODES ENUM


output should be byteCode then evaluated by the VM.


** CHALLENGE:

**** when defining <:identifier> the body of this func should be stored somewhere that is not the body of the bytecode

- I consider storing it in VM Main Memory ( I suppose will be the same for other conditional block of code ) 

