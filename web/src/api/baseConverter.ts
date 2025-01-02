const simbolos = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function complementoParaSinalMagnitude(numero, base) {

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

function decimalParaBaseSinalMagnitude(numero, base) {

    const negativo = numero < 0;
    const numeroMagnitude = BigInt(Math.abs(Number(numero)));

    function paraBase(numero, base) {
        const simbolos = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

function paraComplementoDaBase(numero, base, nCasas) {

    const isNegativo = numero.startsWith("-");
    const numSemSinal = isNegativo ? numero.slice(1) : numero;
    const valorDecimal = BigInt(parseInt(numSemSinal, base));

    if (isNaN(Number(valorDecimal))) {
        throw new Error("Número inválido para a base especificada.");
    }

    const maxValor = BigInt(base) ** BigInt(nCasas) - BigInt(1);

    if (valorDecimal > maxValor) {
        throw new Error("O número excede o limite representável pelo número de casas e base fornecidos.");
    }

    if (!isNegativo) {
        return valorDecimal.toString(base).padStart(nCasas, "0").toUpperCase();
    }

    const complemento = maxValor - valorDecimal + BigInt(1);
    const resultado = complemento.toString(base).padStart(nCasas, "0").toUpperCase();

    return resultado;
}

export function converterBase(num, baseOrigem, baseDestino, complementoOrigem = false, resultadoComplemento = false, precisao = 10) {
    const domain = simbolos.slice(0, baseOrigem);
    let invalidValue = false;
    num.split('').map((char) => {
        if(domain.indexOf(char) < 0 && char != '-'){
            invalidValue = true
        }    
    })
    if (typeof num !== 'string' || invalidValue) {
        throw new Error("O número fornecido contém caracteres inválidos para a base de origem.");
    }
    if ( baseOrigem < 2 || baseOrigem > simbolos.length) {
        throw new Error("Base de origem inválida. Deve estar entre 2 e " + simbolos.length + ".");
    }
    if (baseDestino < 2 || baseDestino > simbolos.length) {
        throw new Error("Base de destino inválida. Deve estar entre 2 e " + simbolos.length + ".");
    }
    if (precisao <= 0 || precisao > 32) {
        throw new Error("Precisão deve ser um valor positivo menor que 32.");
    }

    let valDecimal;
    if (complementoOrigem) {
        valDecimal = complementoParaSinalMagnitude(num, baseOrigem);
    } else {
        valDecimal = BigInt(parseInt(num, baseOrigem));
        if (isNaN(Number(valDecimal))) {
            throw new Error("Falha na conversão do número para decimal com a base de origem.");
        }
    }

    const valConvertido = decimalParaBaseSinalMagnitude(valDecimal, baseDestino);

    if (resultadoComplemento) {
        return paraComplementoDaBase(valConvertido, baseDestino, precisao);
    }
    return valConvertido;
}