export function floatToIEEE754(num: number) {
	const buffer = new ArrayBuffer(4);
	const view = new DataView(buffer);

	view.setFloat32(0, num);

	const intRepresentation = view.getUint32(0);

	let binaryString = intRepresentation.toString(2).padStart(32, '0');

	return binaryString;
}

export function ieee754ToFloat(input: string, base: number) {
	let binaryStr;

	if (base == 16) {
		binaryStr = parseInt(input, 16).toString(2).padStart(32, '0')
	} else { // Binario
		binaryStr = input.padStart(32, '0')
	}

	// Extrai partes
	const signBit = parseInt(binaryStr[0], 2);
	const exponentBits = parseInt(binaryStr.slice(1, 9), 2);
	const fractionBits = binaryStr.slice(9);

	// Cálculos
	const sign = signBit === 0 ? 1 : -1;
	const exponent = exponentBits - 127; // Excesso de 127
	let fraction = 1; // Começa com 1 por causa do bit "implícito" no IEEE754 normalizado

	// Soma a parte fracionária
	for (let i = 0; i < fractionBits.length; i++) {
		if (fractionBits[i] === '1') {
			fraction += Math.pow(2, -(i + 1));
		}
	}

	const value = sign * fraction * Math.pow(2, exponent);

	return value;
}

