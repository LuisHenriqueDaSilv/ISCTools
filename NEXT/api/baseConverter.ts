const simbolos = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function complementoParaSinalMagnitude(numero:string, base:number) {
    const tamanho = numero.length;
    const maxValor = BigInt(base) ** BigInt(tamanho);

    let numeroDecimal = BigInt(parseInt(numero, base));
    if (numero.split('')[0] == simbolos[base - 1]) {
        if (numeroDecimal >= maxValor / BigInt(2)) {
            numeroDecimal = numeroDecimal - maxValor;
        }
    }

    return numeroDecimal;
}

function decimalParaBaseSinalMagnitude(numero:bigint, base:number) {
    const negativo = numero < 0;
    const numeroMagnitude = BigInt(Math.abs(Number(numero)));

    function paraBase(numero:bigint, base:number) {
        let resultado = '';
        const bigBase = BigInt(base);

        while (numero > 0) {
            resultado = simbolos[Number(numero % bigBase)] + resultado;
            numero = numero / bigBase;
        }

        return resultado || '0';
    }

    let numeroBase = paraBase(numeroMagnitude, base);
    if (negativo) {
        numeroBase = '-' + numeroBase;
    }

    return numeroBase;
}

function paraComplementoDaBase(numero:string, base:number, nCasas:number) {
    const isNegativo = numero.startsWith("-");
    const numSemSinal = isNegativo ? numero.slice(1) : numero;
    
    // Check if the number even fits in the parsing logic
    if (numSemSinal === "") {
        throw new Error("O valor para conversão está vazio.");
    }

    const valorDecimal = BigInt(parseInt(numSemSinal, base));
    if (isNaN(Number(valorDecimal))) {
        throw new Error(`O valor '${numSemSinal}' é inválido para a base ${base}.`);
    }

    const maxValor = BigInt(base) ** BigInt(nCasas) - BigInt(1);
    const minValor = -(BigInt(base) ** BigInt(nCasas) / BigInt(2));
    const realMaxValor = (BigInt(base) ** BigInt(nCasas) / BigInt(2)) - BigInt(1);

    // Validation for signed range if likely intended for complement
    if (valorDecimal > maxValor) {
        throw new Error(`O número excede o limite representável de ${nCasas} bits.`);
    }

    if (!isNegativo) {
        return valorDecimal.toString(base).padStart(nCasas, "0").toUpperCase();
    }

    const complemento = maxValor - valorDecimal + BigInt(1);
    return complemento.toString(base).padStart(nCasas, "0").toUpperCase();
}

export function converterBase(num:string, baseOrigem:number, baseDestino:number, complementoOrigem = false, resultadoComplemento = false, precisao:number = 10) {
    if (!num || num.trim() === "") {
        throw new Error("Por favor, insira um valor para converter.");
    }

    const cleanNum = num.toUpperCase().trim();
    const domain = simbolos.slice(0, baseOrigem);
    
    for (const char of cleanNum) {
        if (domain.indexOf(char) < 0 && char !== '-') {
            throw new Error(`Caractere inválido '${char}' para a base ${baseOrigem}.`);
        }
    }

    if (baseOrigem < 2 || baseOrigem > simbolos.length) {
        throw new Error(`Base de origem ${baseOrigem} inválida. Use entre 2 e ${simbolos.length}.`);
    }
    if (baseDestino < 2 || baseDestino > simbolos.length) {
        throw new Error(`Base de destino ${baseDestino} inválida. Use entre 2 e ${simbolos.length}.`);
    }

    let valDecimal;
    try {
        if (complementoOrigem) {
            valDecimal = complementoParaSinalMagnitude(cleanNum, baseOrigem);
        } else {
            valDecimal = BigInt(parseInt(cleanNum, baseOrigem));
        }
        
        if (isNaN(Number(valDecimal))) {
            throw new Error("Falha ao interpretar o número na base de origem.");
        }
    } catch (e: any) {
        throw new Error(`Erro na interpretação: ${e.message}`);
    }

    const valConvertido = decimalParaBaseSinalMagnitude(valDecimal, baseDestino);

    if (resultadoComplemento) {
        return paraComplementoDaBase(valConvertido, baseDestino, precisao);
    }
    return valConvertido;
}