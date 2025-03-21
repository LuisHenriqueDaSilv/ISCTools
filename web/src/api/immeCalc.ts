import { converterBase } from "./baseConverter";

const simbolos = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function immeCalc(num:string, selectedFmts:string , inputType:string, base:number) {
  const domain = simbolos.slice(0, base);
  let invalidValue = false;
  num.split('').map((char:string) => {
      if(domain.indexOf(char) < 0 && char != '-'){
          invalidValue = true
      }    
  })
  if (typeof num !== 'string' || invalidValue) {
      throw new Error("O número fornecido contém caracteres inválidos para a base de origem.");
  }

  let newNum:number = parseInt(num)
  if(inputType == "operacoes"){
    newNum = newNum*4
  }
  const bin = converterBase(`${newNum}`, base, 2, false, true, 32 )
  if(selectedFmts == 'J'){
    const firstPart = bin.slice(21, 31)
    const secondPart = bin.slice(12, 20)
    const ans = `${bin[0]}${firstPart}${bin[20]}${secondPart}`
    return ans
  } else if (selectedFmts == 'B'){
    const firstPart = bin.slice(27, 31)
    const secondPart = bin.slice(21, 27)
    const ans = `${bin[0]}${secondPart}xxxxxxxxxxxxx${firstPart}${bin[20]}xxxxxxx `
    return ans
  } else {
    return 'FMTS desconhecido'
  }
}
