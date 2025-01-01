function converterBase(num, baseOrigem, baseDestino, complementoOrigem = false, resultadoComplemento = false, precisao = 10) {
    function paraDecimal(numero, base, complemento) {
        if (complemento) {
            const maxValor = Math.pow(base, numero.length) - 1;
            numero = parseInt(numero, base);
            return numero > maxValor / 2 ? numero - maxValor - 1 : numero;
        }
        return parseInt(numero, base);
    }

    function deDecimal(numero, base, complemento, precisao) {
        if (complemento) {
            const maxValor = Math.pow(base, precisao) - 1;
            numero = (numero < 0) ? maxValor + numero + 1 : numero;
        }
        return numero.toString(base).toUpperCase();
    }

    let numeroDecimal = paraDecimal(num, baseOrigem, complementoOrigem);

    if (!resultadoComplemento && numeroDecimal < 0) {
        return `-${deDecimal(-numeroDecimal, baseDestino, false, precisao)}`;
    }

    return deDecimal(numeroDecimal, baseDestino, resultadoComplemento, precisao);
}

console.log(converterBase("999999101", 10, 10, true, false)); // Saída: 10