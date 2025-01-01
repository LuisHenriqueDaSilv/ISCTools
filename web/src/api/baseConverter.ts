function converterBase(num, baseOrigem, baseDestino, complementoTipo, precisao) {
    // Validação das entradas
    if (baseOrigem < 2 || baseOrigem > 16 || baseDestino < 2 || baseDestino > 16) {
        return "Erro: Bases devem estar entre 2 e 16.";
    }

    if (!num) {
        return "Erro: Número de entrada vazio.";
    }

    const validChars = [...Array(10).keys()].map(String).concat("A", "B", "C", "D", "E", "F");
    if (![...num.toUpperCase()].every(char => validChars.slice(0, baseOrigem).includes(char))) {
        return "Erro: Número de entrada inválido para a base de origem.";
    }

    if (![0, 1, 2].includes(complementoTipo)) {
        return "Erro: Tipo de complemento inválido (0, 1 ou 2).";
    }

    // Conversão para decimal
    let valorDecimal = parseInt(num, baseOrigem);

    if (isNaN(valorDecimal)) {
        return "Erro: Conversão para decimal falhou.";
    }

    // Aplicação do complemento (se necessário)
    if (complementoTipo !== 0) {
        const limite = Math.pow(baseOrigem, num.length);
        if (complementoTipo === 1) {
            valorDecimal = limite - 1 - valorDecimal;
        } else if (complementoTipo === 2) {
            valorDecimal = limite - valorDecimal;
        }
    }

    // Tratamento do zero
    if (valorDecimal === 0) {
        return "0".padStart(precisao, '0');
    }

    // Conversão para a base de destino
    let resultado = Math.abs(valorDecimal).toString(baseDestino).toUpperCase();

    // Preenchimento com zeros à esquerda
    resultado = resultado.padStart(precisao, '0');

    // Retorno do resultado
    return resultado;
}