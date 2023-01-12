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


main.s

```
  store A 10
  add A 20
  print A
  
```


Example.

```
 essamble main.s
```


output should be byteCode then evaluated by the VM.

