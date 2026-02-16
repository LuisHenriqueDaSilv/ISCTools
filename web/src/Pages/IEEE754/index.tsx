
import { useState } from 'react'
import styles from './styles.module.scss'
import { converterBase } from "../../api/baseConverter"
import { floatToIEEE754, ieee754ToFloat } from "../../api/IEEE754"
import { Card } from '../../Components/UI/Card'
import { Input } from '../../Components/UI/Input'
import { Select } from '../../Components/UI/Select'
import { Button } from '../../Components/UI/Button'

export default function IEEE754() {

	const [input, setInput] = useState<string>("");
	const [mode, setMode] = useState<"toIEEE754" | "toDecimal">('toDecimal')
	const [base, setBase] = useState<string>("16");
	const [result, setResult] = useState<string>("")

	function convert(event: React.FormEvent) {
		event.preventDefault()
		if (!input) { return }
		if (mode === "toIEEE754") {
			const result = floatToIEEE754(Number.parseFloat(input))
			const hexa = converterBase(result, 2, 16, false, false, 32)
			const ans = `Binário: ${result}\nHexadecimal: ${hexa}`
			setResult(ans)
		} else {
			const ans = ieee754ToFloat(input, Number.parseInt(base))
			setResult(ans.toString())
		}
	}

	const baseOptions = [
		{ value: 2, label: '2' },
		{ value: 16, label: '16' }
	];

	return (
		<div className={styles.container}>

			<header className={styles.header}>
				<h1>Conversor IEEE754</h1>
				<p>
					Converta números de ponto flutuante decimais para a representação IEEE 754 de 32 bits e vice-versa.
				</p>
			</header>

			<div className={styles.contentGrid}>
				<Card className={styles.formCard}>
					<form onSubmit={convert} className={styles.form}>
						<div className={styles.row}>
							<div className={styles.toggleGroup}>
								<label>Direção da Conversão</label>
								<div className={styles.toggles}>
									<Button
										type="button"
										variant={mode === "toIEEE754" ? 'secondary' : 'ghost'}
										className={mode === "toIEEE754" ? styles.activeToggle : ''}
										onClick={() => setMode("toIEEE754")}
										size="sm"
									>Decimal → IEEE754</Button>
									<Button
										type="button"
										variant={mode === "toDecimal" ? 'secondary' : 'ghost'}
										className={mode === "toDecimal" ? styles.activeToggle : ''}
										onClick={() => setMode("toDecimal")}
										size="sm"
									>IEEE754 → Decimal</Button>
								</div>
							</div>
						</div>

						<div className={styles.row}>
							<Input
								label={mode === "toDecimal" ? "Valor IEEE754:" : "Número Decimal:"}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={mode === "toDecimal" ? "Ex: 01000000010010010000111111011011" : "Ex: 3.14159"}
							/>
						</div>

						{mode === "toDecimal" && (
							<div className={styles.row}>
								<Select
									label="Base do valor IEEE754"
									value={base}
									onChange={(e) => setBase(e.target.value)}
									options={baseOptions}
								/>
							</div>
						)}

						<Button type="submit" size="lg" className={styles.submitBtn}>
							Converter
						</Button>
					</form>
				</Card>

				{result && (
					<Card className={styles.resultCard} variant="result">
						<label>Resultado</label>
						<div className={styles.resultValue}>{result}</div>
					</Card>
				)}
			</div>
		</div>
	)
}