import { converterBase } from "./baseConverter";

const simbolos = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function immeCalc(num:string, selectedFmts:string , inputType:string, base:number) {
  if (!num || num.trim() === "") {
    throw new Error("O valor imediato não pode estar vazio.");
  }

  const domain = simbolos.slice(0, base);
  const cleanNum = num.toUpperCase().trim();
  
  for (const char of cleanNum) {
    if (domain.indexOf(char) < 0 && char !== '-') {
      throw new Error(`O caractere '${char}' não é válido para a base ${base}.`);
    }
  }

  let newNum:number = parseInt(cleanNum, base);
  if (isNaN(newNum)) {
    throw new Error("Não foi possível processar o número fornecido.");
  }

  if(inputType == "operacoes"){
    newNum = newNum * 4;
  }

  try {
    const bin = converterBase(`${newNum}`, 10, 2, false, true, 32);
    if(selectedFmts == 'J'){
        const firstPart = bin.slice(21, 31);
        const secondPart = bin.slice(12, 20);
        return `${bin[0]}${firstPart}${bin[20]}${secondPart}`;
    } else if (selectedFmts == 'B'){
        const firstPart = bin.slice(27, 31);
        const secondPart = bin.slice(21, 27);
        return `${bin[0]}${secondPart}xxxxxxxxxxxxx${firstPart}${bin[20]}xxxxxxx `;
    } else {
        throw new Error(`Formato de instrução '${selectedFmts}' desconhecido.`);
    }
  } catch (e: any) {
    throw new Error(`Erro no cálculo: ${e.message}`);
  }
}
