import { useState } from 'react'
import styles from './styles.module.scss'

import {converterBase} from "../../api/baseConverter"
import { floatToIEEE754, ieee754ToFloat } from "../../api/IEEE754"

export default function IEEE754() {

	const [input, setInput] = useState<string>("");
	const [mode, setMode] = useState<"toIEEE754" | "toDecimal">('toDecimal')
	const [base, setBase] = useState<string>("16");
	const [result, setResult] = useState<string>("")

	function convert(event: FormDataEvent) {
		event.preventDefault()
		if(!input){return}
		if(mode == "toIEEE754"){
			const result = floatToIEEE754(Number.parseFloat(input))
			const hexa = converterBase(result, 2, 16, false, false, 32) 
			const ans = `Binário: ${result}\nHexadecimal: ${hexa}`
			setResult(ans)
		} else {
			const ans = ieee754ToFloat(input, Number.parseInt(base))
			setResult(ans.toString())
		}
	}

	return (
		<div className={styles.container}>

			<header className={styles.header}>
				<h1>Conversor IEEE754</h1>
				<p>
					Esta ferramenta permite converter números de ponto flutuante decimais para a representação IEEE 754 de 32 bits,
					e também realizar o caminho inverso, convertendo de IEEE 754 para decimal. Para utilizá-la, insira o número
					decimal que deseja converter ou o valor binário/hexadecimal no formato IEEE 754. A calculadora irá gerar
					automaticamente a conversão correspondente.
				</p>
			</header>

			{/*@ts-ignore*/}
			<form onSubmit={convert}>

				<div>
					<label>
					{
						mode == "toDecimal"? "Valor IEEE754:": "Numero decimal:"
					}
					</label>
					<input
						type="text"
						onChange={(event) => setInput(event.target.value)}
						value={input}
					/>
				</div>

				<div>
					<label>O que é o valor digitado</label>
					<div className={styles.buttonsContainer}>
						<button
							type="button"
							className={mode === "toIEEE754" ? styles.selectedButton : ''}
							onClick={() => { setMode("toIEEE754") }}
						>Decimal</button>
						<button
							type="button"
							className={mode == "toDecimal" ? styles.selectedButton : ''}
							onClick={() => { setMode("toDecimal") }}
						>IEEE754</button>

					</div>
				</div>

				{
					mode == "toDecimal" ? (
						<div>
							<label>base:</label>

							<select
							onChange={(choice) => setBase(choice.target.value)}
							value={base}
							>
								<option value={2}>
									2
								</option>
								<option value={16}>
									16
								</option>
							</select>
						</div>
					) : null
				}


				<button className={styles.submitButton} type="submit">converter</button>
			</form>

			<div className={styles.resultsContainer}>
				<label>resultado:</label>
				<h1>{result}</h1>
			</div>
		</div>
	)
}