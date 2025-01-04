// Mapeamento de instruções com base no opcode, funct3 e funct7


// Função para converter código binário em instrução RISC-V
function binaryToRiscvInstruction(binaryCode) {
  const opcode = binaryCode.slice(25, 32); // Últimos 7 bits
  const funct3 = binaryCode.slice(17, 20); // Bits 17-19
  const funct7 = binaryCode.slice(0, 7); // Primeiros 7 bits
  const rd = parseInt(binaryCode.slice(7, 12), 2); // Registrador de destino (5 bits)
  const rs1 = parseInt(binaryCode.slice(12, 17), 2); // Registrador fonte 1 (5 bits)
  const rs2 = parseInt(binaryCode.slice(20, 25), 2); // Registrador fonte 2 (5 bits)
  const imm = parseInt(binaryCode.slice(0, 12), 2); // Imediato (12 bits, pode ser negativo)
  
  let instruction = "";
  
  // Verifica o formato da instrução (R, I, S, etc.) e mapeia a instrução
  if (instructions[opcode] && instructions[opcode][funct3]) {
    const instr = instructions[opcode][funct3];
    if (typeof instr === "string") {
      // Instrução do tipo I, S ou B
      if (opcode === "0000011" || opcode === "0010011" || opcode === "1100011") {
        instruction = `${instr} x${rd}, x${rs1}, ${imm}`;
      } else if (opcode === "0110011") {
        // Instrução do tipo R
        instruction = `${instr} x${rd}, x${rs1}, x${rs2}`;
      }
    } else if (typeof instr === "object" && instr[funct7]) {
      // Lida com instruções que dependem de funct7
      instruction = `${instr[funct7]} x${rd}, x${rs1}, x${rs2}`;
    }
  }

  return instruction || "Instrução desconhecida"; // Se não encontrar
}

// Testando a função com um exemplo
const binExample = "00000000000000010000000010010011"; // Exemplo de código binário (addi t1, t2, 3)
console.log(binaryToRiscvInstruction(binExample)); // Deve retornar: addi x6, x5, 3
