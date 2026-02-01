export function floatToIEEE754(num: number) {
    if (isNaN(num)) {
        throw new Error("O valor fornecido não é um número válido.");
    }
	const buffer = new ArrayBuffer(4);
	const view = new DataView(buffer);

	view.setFloat32(0, num);

	const intRepresentation = view.getUint32(0);
	return intRepresentation.toString(2).padStart(32, '0');
}

export function ieee754ToFloat(input: string, base: number) {
    if (!input || input.trim() === "") {
        throw new Error("Por favor, insira um padrão IEEE 754.");
    }

    const cleanInput = input.trim().toUpperCase();
	let binaryStr;

	if (base == 16) {
        if (!/^[0-9A-F]+$/.test(cleanInput)) {
            throw new Error("Padrão hexadecimal inválido.");
        }
        if (cleanInput.length > 8) {
            throw new Error("O padrão hexadecimal deve ter no máximo 8 caracteres (32 bits).");
        }
		binaryStr = parseInt(cleanInput, 16).toString(2).padStart(32, '0');
	} else { // Binario
        if (!/^[01]+$/.test(cleanInput)) {
            throw new Error("O padrão binário deve conter apenas 0 e 1.");
        }
        if (cleanInput.length > 32) {
             throw new Error("O padrão binário deve ter no máximo 32 bits.");
        }
		binaryStr = cleanInput.padStart(32, '0');
	}

	// Extrai partes
	const signBit = parseInt(binaryStr[0], 2);
	const exponentBits = parseInt(binaryStr.slice(1, 9), 2);
	const fractionBits = binaryStr.slice(9);

	// Cálculos
	const sign = signBit === 0 ? 1 : -1;
	const exponent = exponentBits - 127; 
	let fraction = 1; 

	for (let i = 0; i < fractionBits.length; i++) {
		if (fractionBits[i] === '1') {
			fraction += Math.pow(2, -(i + 1));
		}
	}

	return sign * fraction * Math.pow(2, exponent);
}
