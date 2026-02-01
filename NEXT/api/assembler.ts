import { InstructionSet, RegisterSet } from '@/types';
import { converterBase } from './baseConverter'
import { immeCalc } from './immeCalc'

const instructionSet:InstructionSet = {
  add: { opcode: "0110011", funct3: "000", funct7: "0000000" },
  sub: { opcode: "0110011", funct3: "000", funct7: "0100000" },
  addi: { opcode: "0010011", funct3: "000" },
  slli: { opcode: "0010011", funct3: "001" },
  slti: { opcode: "0010011", funct3: "010" },
  sltiu: { opcode: "0010011", funct3: "011" },
  xori: { opcode: "0010011", funct3: "100" },
  srli: { opcode: "0010011", funct3: "101", funct7: "0000000" },
  srai: { opcode: "0010011", funct3: "101", funct7: "0100000" },
  ori: { opcode: "0010011", funct3: "110" },
  andi: { opcode: "0010011", funct3: "111" },
  lb: { opcode: "0000011", funct3: "000" },
  lh: { opcode: "0000011", funct3: "001" },
  lw: { opcode: "0000011", funct3: "010" },
  lbu: { opcode: "0000011", funct3: "100" },
  lhu: { opcode: "0000011", funct3: "101" },
  auipc: {opcode:"0010111", funct3:"000"},
  sb: {opcode: "0100011", funct3: "000"},
  sh: {opcode: "0100011", funct3: "001"},
  sw: {opcode: "0100011", funct3: "010"},
  mul: {opcode: "0110011", funct3: "000", funct7: "0000001"},
  mulh: {opcode: "0110011", funct3: "001", funct7: "0000001"},
  mulhsu: {opcode: "0110011", funct3: "010", funct7: "0000001"},
  mulhu: {opcode: "0110011", funct3: "011", funct7: "0000001"},
  div: {opcode: "0110011", funct3: "100", funct7: "0000001"},
  divu: {opcode: "0110011", funct3: "101", funct7: "0000001"},
  rem: {opcode: "0110011", funct3: "110", funct7: "0000001"},
  srl: {opcode: "0110011", funct3: "101", funct7: "0000000"},
  sra: {opcode: "0110011", funct3: "101", funct7: "0100000"},
  sll: {opcode: "0110011", funct3: "001", funct7: "0000000"},
  slt: {opcode: "0110011", funct3: "010", funct7: "0000000"},
  sltu: {opcode: "0110011", funct3: "011", funct7: "0000000"},
  xor: {opcode: "0110011", funct3: "100", funct7: "0000000"},
  or: {opcode: "0110011", funct3: "110", funct7: "0000000"},
  and: {opcode: "0110011", funct3: "111", funct7: "0000000"},
  lui: {opcode: "0110111", funct3: "000"},
  beq: {opcode: "1100011", funct3: "000"},
  bne: {opcode: "1100011", funct3: "001"},
  blt: {opcode: "1100011", funct3: "100"},
  bge: {opcode: "1100011", funct3: "101"},
  bltu: {opcode: "1100011", funct3: "110"},
  bgeu: {opcode: "1100011", funct3: "111"},
  jalr: {opcode: "1100111", funct3: "000"},
  jal: {opcode: "1101111", funct3: "000"},
  ecall: {opcode: "1110011", funct3: "000"},
  uret: {opcode: "1110011", funct3: "000"},
  ret: {},
  j: {opcode: "1101111"},
  li: {opcode: "0010011", funct3: "000"}

};

const registerMap:RegisterSet = {
  x0: "00000", zero: "00000",
  x1: "00001", ra: "00001",
  x2: "00010", sp: "00010",
  x3: "00011", gp: "00011",
  x4: "00100", tp: "00100",
  x5: "00101", t0: "00101",
  x6: "00110", t1: "00110",
  x7: "00111", t2: "00111",
  x8: "01000", s0: "01000",
  x9: "01001", s1: "01001",
  x10: "01010", a0: "01010",
  x11: "01011", a1: "01011",
  x12: "01100", a2: "01100",
  x13: "01101", a3: "01101",
  x14: "01110", a4: "01110",
  x15: "01111", a5: "01111",
  x16: "10000", a6: "10000",
  x17: "10001", a7: "10001",
  x18: "10010", s2: "10010",
  x19: "10011", s3: "10011",
  x20: "10100", s4: "10100",
  x21: "10101", s5: "10101",
  x22: "10110", s6: "10110",
  x23: "10111", s7: "10111",
  x24: "11000", s8: "11000",
  x25: "11001", s9: "11001",
  x26: "11010", s10: "11010",
  x27: "11011", s11: "11011",
  x28: "11100", t3: "11100",
  x29: "11101", t4: "11101",
  x30: "11110", t5: "11110",
  x31: "11111", t6: "11111"
}

function assemble(instruction:string) {
  const [instr, ...args] = instruction.toLowerCase().replace(/,|\(/g, " ").replace(/\)/g, "").split(/\s+/).filter(x => x !== "");
  const details = instructionSet[instr];

  if (!details) throw new Error(`Instrução desconhecida: ${instr}`);

  const getReg = (index: number, name: string) => {
    if (args[index] === undefined) throw new Error(`Está faltando o registrador ${name}`);
    if (!registerMap[args[index]]) throw new Error(`Registrador inválido: ${args[index]}`);
    return registerMap[args[index]];
  };

  const getImme = (index: number, size: number, name: string) => {
    if (args[index] === undefined) throw new Error(`Está faltando o imediato/valor ${name}`);
    try {
        return converterBase(args[index], 10, 2, false, true, size);
    } catch (e: any) {
        throw new Error(`Erro no imediato ${name}: ${e.message}`);
    }
  };

  switch (instr) {
    case "add":
    case "sub":
    case "mul":
    case "mulh":
    case "mulhsu":
    case "mulhu":
    case "div":
    case "divu":
    case "rem":
    case "srl":
    case "sra":
    case "sll":
    case "slt":
    case "sltu":
    case "xor":
    case "or":
    case "and":
      return (
        details.funct7 +
        getReg(2, "rs2") +
        getReg(1, "rs1") +
        details.funct3 +
        getReg(0, "rd") +
        details.opcode
      );
    case "addi":
    case "slli":
    case "slti":
    case "sltiu":
    case "ori":
    case "andi":
    case "xori": 
      return (
        getImme(2, 12, "imm") +
        getReg(1, "rs1") +
        details.funct3 +
        getReg(0, "rd") +
        details.opcode
      );
    case "srli":
    case "srai": 
      return (
        details.funct7 +
        getImme(2, 5, "shamt") +
        getReg(1, "rs1") +
        details.funct3 +
        getReg(0, "rd") +
        details.opcode
      );
    case "lb":
    case "lh":
    case "lw":
    case "lbu":
    case "lhu": {
      const rd = getReg(0, "rd");
      const imm = getImme(1, 12, "offset");
      const rs1 = getReg(2, "rs1");
      return imm + rs1 + details.funct3 + rd + details.opcode;
    }
    case "auipc": {
      return getImme(1, 20, "imm") + getReg(0, "rd") + details.opcode;
    }
    case "sb":
    case "sh":
    case "sw": {
      const rs2 = getReg(0, "rs2");
      const imm = getImme(1, 12, "offset");
      const rs1 = getReg(2, "rs1");
      return (
        imm.slice(0, 7) +
        rs2 +
        rs1 +
        details.funct3 +
        imm.slice(7, 12) +
        details.opcode
      );
    }
    case "lui": {
      return getImme(1, 20, "imm") + getReg(0, "rd") + details.opcode;
    }
    case "beq":
    case "bne":
    case "blt":
    case "bge":
    case "bltu":
    case "bgeu": {
      const rs1 = getReg(0, "rs1");
      const rs2 = getReg(1, "rs2");
      if (args[2] === undefined) throw new Error(`Está faltando o imediato/offset de salto`);
      try {
          const imme = immeCalc(args[2], 'B', 'byte', 10);
          return (
            imme.slice(0, 7)+
            rs2 +
            rs1 +
            details.funct3+
            imme.slice(20, 25)+
            details.opcode
          );
      } catch (e: any) {
          throw new Error(`Erro no salto: ${e.message}`);
      }
    }
    case "jalr": {
        const rd = getReg(0, "rd");
        const rs1 = getReg(1, "rs1");
        const imm = getImme(2, 12, "offset");
        return imm + rs1 + details.funct3 + rd + details.opcode;
    }
    case "jal": {
      const rd = getReg(0, "rd");
      if (args[1] === undefined) throw new Error(`Está faltando o imediato/offset de salto`);
      try {
          const immed = immeCalc(args[1], 'J', 'byte', 10);
          return immed + rd + details.opcode;
      } catch (e: any) {
        throw new Error(`Erro no salto: ${e.message}`);
      }
    }
    case "ecall": return "00000000000000000000000001110011";
    case "uret": return "00000000001000000000000001110011";
    case "ret": return "00000000000000001000000001100111";
    case "j": {
      if (args[0] === undefined) throw new Error(`Está faltando o destino do pulo (j)`);
      try {
          const immed = immeCalc(args[0], 'J', 'byte', 10);
          return immed + "00000" + details.opcode;
      } catch (e: any) {
        throw new Error(`Erro no pulo: ${e.message}`);
      }
    }
    case "li": {
       const rd = getReg(0, "rd");
       const imm = getImme(1, 12, "imm");
       return imm + "00000" + details.funct3 + rd + details.opcode;
    }
    default:
      throw new Error(`Tipo de instrução não implementado: ${instr}`);
  }
}

export function assembler(instructs:string, base:Number) {
  const instructions = instructs.split('\n')
  const ans = [] as any

  instructions.map((instruction:any) => {
    const trimmed = instruction.trim();
    if (trimmed !== "") {
      try {
        let ans_ = assemble(trimmed);
        if(base == 16){
          ans_ = `0x${converterBase(ans_, 2, 16, false, true, 8)}`
        }
        ans.push(ans_)
      } catch (error: any) {
        ans.push(`Erro: ${error.message}`);
      }
    }
  })
  return ans
}
