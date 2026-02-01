"use client";
import { useState } from "react";
import { Zap } from "lucide-react";
import styles from './styles.module.scss'
import { immeCalc } from "@/api/immeCalc";

const fmts = [
  { key: "B", label: "Tipo Branch (B)" },
  { key: "J", label: "Tipo Jump (J)" },
]

export default function Immediato() {

  const [selectedFmts, setSelectedFmts] = useState('B');
  const [selectedInputType, setSelectedInputType] = useState('byte');
  const [numberInput, setNumberInput] = useState('');
  const [base, setBase] = useState('10');
  const [result, setResult] = useState('');

  function calc(event: any) {
    event.preventDefault()
    try {
      const res = immeCalc(numberInput.toUpperCase().trim(), selectedFmts, selectedInputType, parseInt(base));
      setResult(res)
    } catch (error) {
      setResult(`${error}`);      
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
            <Zap className={styles.icon} size={24} />
            <h1>Calculadora de Imediato</h1>
        </div>
        <p>Calcule valores imediatos de RISC-V para saltos condicionais e incondicionais.</p>
      </header>

      <form onSubmit={calc} className={styles.toolForm}>
        <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Formato da Instrução</label>
                <select className={styles.inputField} onChange={(e) => setSelectedFmts(e.target.value)} value={selectedFmts}>
                    {fmts.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                </select>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Unidade de Distância</label>
                <select className={styles.inputField} onChange={(e) => setSelectedInputType(e.target.value)} value={selectedInputType}>
                    <option value="byte">Offset em Bytes</option>
                    <option value="operacoes">Contagem de Instruções</option>
                </select>
            </div>
        </div>

        <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Distância Relativa</label>
                <input
                    className={styles.inputField}
                    onChange={(e) => setNumberInput(e.target.value)}
                    value={numberInput}
                    placeholder="ex: -4, 8, 12..."
                    type="text"
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Base Numérica</label>
                <select className={styles.inputField} onChange={(e) => setBase(e.target.value)} value={base}>
                    {Array.from({ length: 35 }, (_, i) => (
                        <option key={i + 2} value={i + 2}>Base {i + 2}</option>
                    ))}
                </select>
            </div>
        </div>

        <button className={styles.submitButton}>Gerar Imediato</button>
      </form>

      {result && (
        <div className={styles.resultsArea}>
            <div className={styles.resultCard}>
                <label className={styles.resultLabel}>Imediato Binário (Codificado)</label>
                <div className={styles.resultValue}>{result}</div>
            </div>
        </div>
      )}
    </div>
  )
}