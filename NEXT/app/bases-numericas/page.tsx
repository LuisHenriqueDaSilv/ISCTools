"use client";
import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react';
import styles from './styles.module.scss'

import { converterBase } from '@/api/baseConverter'

export default function BasesNumericas() {

  const [originalNumber, setOriginalNumber] = useState("")
  const [base, setBase] = useState('2')
  const [targetBase, setTargetBase] = useState('10')
  const [originComp, setOriginComp] = useState(false)
  const [targetComp, setTargetComp] = useState(false)
  const [precision, setPrecision] = useState('8')
  const [result, setResult] = useState('')

  function convert(event: any) {
    event.preventDefault()
    try {
      const res = converterBase(originalNumber.toUpperCase().trim(), parseInt(base), parseInt(targetBase), originComp, targetComp, parseInt(precision))
      setResult(res)
    } catch (error) {
      setResult(`${error}`)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
            <ArrowRightLeft className={styles.icon} size={24} />
            <h1>Conversor de Bases</h1>
        </div>
        <p>Converta números inteiros e frações entre qualquer sistema numérico com precisão.</p>
      </header>

      <form onSubmit={convert} className={styles.toolForm}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Valor de Origem</label>
          <input
            type="text"
            className={styles.inputField}
            placeholder="ex: 1010, FF, 42..."
            onChange={(e) => setOriginalNumber(e.target.value)}
            value={originalNumber}
          />
        </div>

        <div className={styles.gridRow}>
            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Base de Origem</label>
                <select className={styles.inputField} onChange={(e) => setBase(e.target.value)} value={base}>
                    {Array.from({ length: 35 }, (_, i) => (
                    <option key={i + 2} value={i + 2}>Base {i + 2}</option>
                    ))}
                </select>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Base de Destino</label>
                <select className={styles.inputField} onChange={(e) => setTargetBase(e.target.value)} value={targetBase}>
                    {Array.from({ length: 35 }, (_, i) => (
                    <option key={i + 2} value={i + 2}>Base {i + 2}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className={styles.optionsRow}>
            <div className={styles.toggleGroup}>
                <label className={styles.inputLabel}>Sinal de Entrada</label>
                <div className={styles.toggleButtons}>
                    <button type="button" onClick={() => setOriginComp(false)} className={`${styles.toggleBtn} ${!originComp ? styles.active : ''}`}>Padrão</button>
                    <button type="button" onClick={() => setOriginComp(true)} className={`${styles.toggleBtn} ${originComp ? styles.active : ''}`}>Complemento</button>
                </div>
            </div>

            <div className={styles.toggleGroup}>
                <label className={styles.inputLabel}>Sinal de Saída</label>
                <div className={styles.toggleButtons}>
                    <button type="button" onClick={() => setTargetComp(false)} className={`${styles.toggleBtn} ${!targetComp ? styles.active : ''}`}>Padrão</button>
                    <button type="button" onClick={() => setTargetComp(true)} className={`${styles.toggleBtn} ${targetComp ? styles.active : ''}`}>Complemento</button>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Precisão</label>
                <select className={styles.inputField} onChange={(e) => setPrecision(e.target.value)} value={precision}>
                    {[4, 8, 16, 32, 64].map(v => (
                        <option key={v} value={v}>{v} bits</option>
                    ))}
                </select>
            </div>
        </div>

        <button className={styles.submitButton} type="submit">Executar Conversão</button>
      </form>

      {result && (
        <div className={styles.resultsArea}>
            <div className={styles.resultCard}>
                <label className={styles.resultLabel}>Resultado Calculado</label>
                <div className={styles.resultValue}>{result}</div>
            </div>
        </div>
      )}
    </div>
  )
}