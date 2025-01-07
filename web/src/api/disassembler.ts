import { converterBase } from "./baseConverter";

const REGISTER_MAP = [
  "zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2",
  "s0", "s1", "a0", "a1", "a2", "a3", "a4", "a5",
  "a6", "a7", "s2", "s3", "s4", "s5", "s6", "s7",
  "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6"
]

const instructions = {
  "0000011": {
    "000": "lb",
    "001": "lh",
    "010": "lw",
    "100": "lbu",
    "101": "lhu"
  },
  "0010011": {
    "000": "addi",
    "001": "slli",
    "010": "slti",
    "011": "sltiu",
    "100": "xori",
    "101": {
      "0000000": "srli",
      "0100000": "srai"
    },
    "110": "ori",
    "111": "andi"
  },
  "0010111": { "000": "auipc" },
  "0100011": {
    "000": "sb",
    "001": "sh",
    "010": "sw"
  },
  "0110011": {
    "000": {
      "0000000": "add",
      "0100000": "sub"
    },
    "101": {
      "0000000": "srl",
      "0100000": "sra"
    },
    "0000001": {
      "000": "mul",
      "001": "mulh",
      "010": "mulhsu",
      "011": "mulhu",
      "100": "div",
      "101": "divu",
      "110": "rem",
      "111": "remu"
    },
    "001": "sll",
    "010": "slt",
    "011": "sltu",
    "100": "xor",
    "110": "or",
    "111": "and"
  },
  "0110111": { "000": "lui" },
  "1100011": {
    "000": "beq",
    "001": "bne",
    "100": "blt",
    "101": "bge",
    "110": "bltu",
    "111": "bgeu"
  },
  "1100111": { "000": "jalr" },
  "1101111": { "000": "jal" },
  "1110011": {
    // "000": "ecall",
    // "000": "uret"
  }
} as any

function decodeRiscV(binary:any) {
  const opcode = binary.slice(25, 32);
  const rd = parseInt(binary.slice(20, 25), 2);
  const funct3 = binary.slice(17, 20);
  const rs1 = parseInt(binary.slice(12, 17), 2);
  const rs2 = parseInt(binary.slice(7, 12), 2);
  const funct7 = binary.slice(0, 7);
  // const imm = binary.slice(0, 12); // Para tipos I/S/B

  switch (opcode) {
    case "0000011": {

      const imme = binary.slice(0, 12)
      const ans = `${instructions[opcode][funct3]} ${REGISTER_MAP[rd]}, ${parseInt(imme, 2)}(${REGISTER_MAP[rs1]})`
      return ans
      break
    }
    case "0010011": {

      if (funct3 == "101") {
        const imme = binary.slice(7, 12)
        const ans = `${instructions[opcode][funct3][funct7]} ${REGISTER_MAP[rd]}, ${REGISTER_MAP[rs1]}, ${converterBase(imme, 2, 10, true, false)}`
        return ans
      } else {
        const imme = binary.slice(0, 12)
        const ans = `${instructions[opcode][funct3]} ${REGISTER_MAP[rd]}, ${REGISTER_MAP[rs1]}, ${converterBase(imme, 2, 10, true, false)}`
        return ans
      }
      break
    }

    case "0010111": {
      const imme = binary.slice(0, 20)
      const ans = `auipc ${REGISTER_MAP[rd]}, ${converterBase(imme, 2, 10, true, false)}`
      return ans
      break
    }

    case "0100011": {
      const imme1 = binary.slice(0, 7)
      const imme2 = binary.slice(20, 25)
      const ans = `${instructions[opcode][funct3]} ${REGISTER_MAP[rs2]}, ${parseInt(`${imme1}${imme2}`, 2)}(${REGISTER_MAP[rs1]})`
      return ans
      break
    }

    case "0110011": {
      if (funct7 == "0000001" && (funct3 == "000" || funct3 == "001" || funct3 == "010" || funct3 == "011" || funct3 == "100" || funct3 == "101" || funct3 == "110" || funct3 == "111"
      )) {
        const ans = `${instructions[opcode][funct7][funct3]} ${REGISTER_MAP[rd]}, ${REGISTER_MAP[rs1]}, ${REGISTER_MAP[rs2]}`
        return ans
      } else if ((funct3 == "000" || funct3 == "101")) {
        const ans = `${instructions[opcode][funct3][funct7]} ${REGISTER_MAP[rd]}, ${REGISTER_MAP[rs1]}, ${REGISTER_MAP[rs2]}`
        return ans
      } else {
        const ans = `${instructions[opcode][funct3]} ${REGISTER_MAP[rd]}, ${REGISTER_MAP[rs1]}, ${REGISTER_MAP[rs2]}`
        return ans
      }
      break
    }

    case "0110111": {
      console.log(funct7)
      const imme = binary.slice(0, 20)
      const ans = `lui ${REGISTER_MAP[rd]}, 0x${converterBase(imme, 2, 16, false, false)}`
      return ans
    }

    case "1100011": {
      const signal = binary[0]
      const imme = `${binary[24]}${binary.slice(1, 7)}${binary.slice(20, 24)}0`.padStart(32, signal)
      const ans = `${instructions[opcode][funct3]} ${REGISTER_MAP[rs1]}, ${REGISTER_MAP[rs2]}, ${converterBase(imme, 2, 10, true, false)}`
      return ans;
    }

    case "1100111": {
        const imme = binary.slice(0, 12)
        const ans = `jalr ${REGISTER_MAP[rd]}, ${REGISTER_MAP[rs1]}, ${converterBase(imme, 2, 10, true, false)}`
        return ans
    }

    case '1101111': {
      const imme = `${binary.slice(12, 20)}${binary[11]}${binary.slice(1, 11)}0`.padStart(32, binary[0])
      const ans = `jal ${REGISTER_MAP[rd]}, ${parseInt(converterBase(imme, 2, 10, true, false))}` 
      return ans
    }

    case '1110011': {
      const rs2b = binary.slice(7, 12)
      if(rs2b == '00010'){
        return 'uret'
      } else {
        return 'ecall'
      }
    }

    default:
      throw new Error("Opcode desconhecido");
  }
}


export function disassembler(instructs:any, base:any) {
  const instructions = instructs.split('\n')

  const ans = [] as any

  instructions.map((instruction:any) => {
    if (instruction != "") {
      let formatedInstruction
      if (base == 16) {
        formatedInstruction = instruction.replace('0x', '')
      } else if (base == 2) {
        formatedInstruction = instruction.replace('0b', '')
      }
      formatedInstruction = formatedInstruction.trim().toUpperCase()
      const binaryInstruction = converterBase(formatedInstruction, base, 2, false, true, 32)
      try {
        ans.push(decodeRiscV(binaryInstruction))
      } catch (error) {
        ans.push(`${error} (${instruction})`)
      }
    }
  })
  return ans
}