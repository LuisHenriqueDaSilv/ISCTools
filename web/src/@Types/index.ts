export interface Instruction {
    opcode?: string;
    funct3?: string;
    funct7?: string;
}

export type RegisterSet = Record<string, string>;
  
export type InstructionSet = Record<string, Instruction>;
type InstructionLeaf = string; // Instrução final mapeada para uma string
export type Funct7Mapping = Record<string, InstructionLeaf>; // Mapeamento de funct7 para instrução
type Funct3Mapping = Record<string, InstructionLeaf | Funct7Mapping>; // funct3 pode mapear diretamente ou para outro objeto
export type OpcodeMapping = Record<string, Funct3Mapping>; // opcode mapeia para funct3