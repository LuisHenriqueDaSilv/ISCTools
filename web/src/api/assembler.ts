import { InstructionSet, RegisterSet } from '../@Types';
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
  x0: "00000",
  zero: "00000",
  x1: "00001",
  ra: "00001",
  x2: "00010",
  sp: "00010",
  x3: "00011",
  gp: "00011",
  x4: "00100",
  tp: "00100",
  x5: "00101",
  t0: "00101",
  x6: "00110",
  t1: "00110",
  x7: "00111",
  t2: "00111",
  x8: "01000",
  s0: "01000",
  x9: "01001",
  s1: "01001",
  x10: "01010",
  a0: "01010",
  x11: "01011",
  a1: "01011",
  x12: "01100",
  a2: "01100",
  x13: "01101",
  a3: "01101",
  x14: "01110",
  a4: "01110",
  x15: "01111",
  a5: "01111",
  x16: "10000",
  a6: "10000",
  x17: "10001",
  a7: "10001",
  x18: "10010",
  s2: "10010",
  x19: "10011",
  s3: "10011",
  x20: "10100",
  s4: "10100",
  x21: "10101",
  s5: "10101",
  x22: "10110",
  s6: "10110",
  x23: "10111",
  s7: "10111",
  x24: "11000",
  s8: "11000",
  x25: "11001",
  s9: "11001",
  x26: "11010",
  s10: "11010",
  x27: "11011",
  s11: "11011",
  x28: "11100",
  t3: "11100",
  x29: "11101",
  t4: "11101",
  x30: "11110",
  t5: "11110",
  x31: "11111",
  t6: "11111"

}

function assemble(instruction:string) {
  const [instr, ...args] = instruction.toLowerCase().replace(/,|\(/g, " ").replace(/\)/g, "").split(/\s+/);
  const details = instructionSet[instr];

  if (!details) throw new Error(`Instrução não conhecida (Tenta no rars): ${instr}`);

  switch (instr) {
    case "add":
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
    case "sub":
      if (
        !registerMap[args[2]] ||
        !registerMap[args[1]] ||
        !registerMap[args[0]]
      ) {
        return `Erro: registrador invalido (${instruction})`
      }
      return (
        details.funct7 +
        registerMap[args[2]] +
        registerMap[args[1]] +
        details.funct3 +
        registerMap[args[0]] +
        details.opcode
      );
    case "addi":
    case "slli":
    case "slti":
    case "sltiu":
    case "ori":
    case "andi":
    case "xori": {
      console.log(args)
      const imme = converterBase(args[2], 10, 2, false, true, 12)
      if (
        !registerMap[args[1]] ||
        !registerMap[args[0]]
      ) {
        return `Erro: registrador invalido (${instruction})`
      }
      return (
        imme +
        registerMap[args[1]] +
        details.funct3 +
        registerMap[args[0]] +
        details.opcode
      )
    }
    case "srli":
    case "srai": {
      if (
        !registerMap[args[1]] ||
        !registerMap[args[0]]
      ) {
        return `Erro: registrador invalido (${instruction})`
      }
      const imme = converterBase(args[2], 10, 2, false, true, 5)
      return (
        details.funct7 +
        imme +
        registerMap[args[1]] +
        details.funct3 +
        registerMap[args[0]] +
        details.opcode
      )
    }
    case "lb":
    case "lh":
    case "lw":
    case "lbu":
    case "lhu": {
      if ( !registerMap[args[2]] || !registerMap[args[0]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const imme = converterBase(args[1], 10, 2, false, true, 12)
      return (
        imme +
        registerMap[args[2]] +
        details.funct3 +
        registerMap[args[0]] +
        details.opcode
      )
    }
    case "auipc": {
      if ( !registerMap[args[0]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const imme = converterBase(args[1], 10, 2, false, true, 20)
      return (
        imme+
        registerMap[args[0]]+
        details.opcode
      )
    }
    case "sb":
    case "sh":
    case "sw": {
      if ( !registerMap[args[2]] || !registerMap[args[0]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const imme = converterBase(args[1], 10, 2, false, true, 12)
      return (
        imme.slice(0,7)+
        registerMap[args[0]] +
        registerMap[args[2]] +
        details.funct3+
        imme.slice(7,12)+
        details.opcode
      )
    }
    case "lui": {
      if (!registerMap[args[0]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const imme = converterBase(args[1], 10, 2, false, true, 20)
      return (
        imme+
        registerMap[args[0]] +
        details.opcode
      )
    }
    case "beq":
    case "bne":
    case "blt":
    case "bge":
    case "bltu":
    case "bgeu": {
      if (!registerMap[args[0]] || !registerMap[args[1]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const imme = immeCalc(args[2], 'B', 'byte', 10)
      return (
        imme.slice(0, 7)+
        registerMap[args[1]]+
        registerMap[args[0]]+
        details.funct3+
        imme.slice(20, 25)+
        details.opcode
      )
    }
    case "jalr": {
      if (!registerMap[args[1]] || !registerMap[args[0]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const immed = converterBase(args[2], 10, 2,false, true, 12)
      return (
        immed+
        registerMap[args[1]]+
        details.funct3+
        registerMap[args[0]]+
        details.opcode
      )
    }
    case "jal": {
      if (!registerMap[args[0]]) {
        return `Erro: registrador invalido (${instruction})`
      }
      const immed = immeCalc(args[1], 'J', 'byte', 10)
      return (
        immed+
        registerMap[args[0]]+
        details.opcode
      )
    }
    case "ecall": {
      return "00000000000000000000000001110011"
    }
    case "uret": {
      return "00000000001000000000000001110011"
    }
    case "ret": {
      return "00000000000000001000000001100111"
    }
    case "j": {
      console.log(args)
      const immed = immeCalc(args[0], 'J', 'byte', 10)
      return (
        immed+
        "00000"+
        details.opcode
      )
    }
    case "li": {
      const imme = converterBase(args[1], 10, 2, false, true, 12)
      if (
        !registerMap[args[0]]
      ) {
        return `Erro: registrador invalido (${instruction})`
      }
      return (
        imme +
        "00000" +
        details.funct3 +
        registerMap[args[0]] +
        details.opcode
      )
    }
    default:
      throw new Error(`Instruction type not implemented: ${instr}`);
  }
}

export function assembler(instructs:string, base:Number) {
  const instructions = instructs.split('\n')

  const ans = [] as any

  instructions.map((instruction:any) => {
    if (instruction != "") {
      const formatedInstruction = instruction.trim().toLowerCase()
      try {
        let ans_ = assemble(formatedInstruction)
        if(base == 16){
          ans_ = `0x${converterBase(ans_, 2, 16, false, true, 8)}`
        }
        ans.push(ans_)
      } catch (error) {
        ans.push(`${error} (${instruction})`)
      }
    }
  })
  return ans
}
