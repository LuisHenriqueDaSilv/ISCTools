"use client";
import { useState } from 'react'
import { Microscope } from 'lucide-react';
import styles from './styles.module.scss'

import { converterBase } from "@/api/baseConverter"
import { floatToIEEE754, ieee754ToFloat } from "@/api/IEEE754"

export default function IEEE754() {

	const [input, setInput] = useState<string>("");
	const [mode, setMode] = useState<"toIEEE754" | "toDecimal">('toDecimal')
	const [base, setBase] = useState<string>("16");
	const [result, setResult] = useState<string>("")

	function convert(event: any) {
		event.preventDefault()
		if(!input){return}
		if(mode == "toIEEE754"){
			const res = floatToIEEE754(Number.parseFloat(input))
            const hexa = converterBase(res, 2, 16, false, false, 32) 
			setResult(`HEX: ${hexa}\nBIN: ${res}`)
		} else {
			const ans = ieee754ToFloat(input, Number.parseInt(base))
			setResult(ans.toString())
		}
	}

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.pageTitle}>
                    <Microscope className={styles.icon} size={24} />
                    <h1>Conversor IEEE 754</h1>
                </div>
				<p>Analise e converta representações de ponto flutuante de 32 bits com facilidade.</p>
			</header>

			<form onSubmit={convert} className={styles.toolForm}>
                <div className={styles.modeToggle}>
                    <button 
                        type="button" 
                        className={mode === "toIEEE754" ? styles.active : ''}
                        onClick={() => setMode("toIEEE754")}
                    >Float para IEEE</button>
                    <button 
                        type="button" 
                        className={mode === "toDecimal" ? styles.active : ''}
                        onClick={() => setMode("toDecimal")}
                    >IEEE para Decimal</button>
                </div>

				<div className={styles.inputGroup}>
					<label>{mode === "toDecimal" ? "Padrão IEEE 754" : "Valor Decimal"}</label>
					<input
						type="text"
                        placeholder={mode === "toDecimal" ? "ex: 4048F5C3 ou 0100..." : "ex: -12.625"}
						onChange={(e) => setInput(e.target.value)}
						value={input}
					/>
				</div>

				{mode === "toDecimal" && (
						<div className={styles.inputGroup}>
							<label>Codificação de Entrada</label>
							<select onChange={(e) => setBase(e.target.value)} value={base}>
								<option value={2}>Binário (32-bit)</option>
								<option value={16}>Hexadecimal</option>
							</select>
						</div>
				)}

				<button className={styles.submitButton} type="submit">Converter Precisão</button>
			</form>

			{result && (
                <div className={styles.resultsArea}>
                    <div className={styles.resultCard}>
                        <label>Saída</label>
                        <div className={styles.resultValue}>{result}</div>
                    </div>
                </div>
			)}
		</div>
	)
}