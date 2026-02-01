"use client";
import { useLayoutEffect, useRef, useState } from 'react';
import { Binary, Play } from 'lucide-react';
import styles from './styles.module.scss'
import { disassembler } from '@/api/disassembler';

export default function Disassembler() {

  const [instructions, setInstructions] = useState('');
  const [base, setBase] = useState('16');
  const [result, setResult] = useState<string[]>([]);
  const textbox = useRef(null);

  function adjustHeight() {
    if (textbox.current) {
        (textbox.current as any).style.height = "inherit";
        (textbox.current as any).style.height = `${(textbox.current as any).scrollHeight}px`;
    }
  }

  useLayoutEffect(adjustHeight, []);

  function handleKeyDown(event: any) {
    setInstructions(event.target.value)
    adjustHeight();
  }

  function convert(event: any) {
    event.preventDefault()
    const ans = disassembler(instructions, parseInt(base))
    setResult(ans)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
            <Binary className={styles.icon} size={24} />
            <h1>Disassembler RISC-V</h1>
        </div>
        <p>Decifre código de máquina de volta para instruções legíveis de Assembly para análise.</p>
      </header>

      <form onSubmit={convert} className={styles.toolForm}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Padrões de Máquina (Uma entrada por linha)</label>
          <textarea
            ref={textbox}
            placeholder="00a00093&#10;00209113"
            onChange={handleKeyDown}
            className={styles.assemblerTextarea}
          />
        </div>

        <div className={styles.bottomRow}>
            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Codificação de Entrada</label>
                <select className={styles.inputField} onChange={(e) => setBase(e.target.value)} value={base}>
                    {Array.from({ length: 35 }, (_, i) => (
                        <option key={i + 2} value={i + 2}>Base {i + 2}</option>
                    ))}
                </select>
            </div>
            <button className={styles.submitButton} type="submit">
                <Play size={16} fill="currentColor" />
                Executar Decodificador
            </button>
        </div>
      </form>

      {result.length > 0 && (
        <div className={styles.resultsArea}>
            <label className={styles.resultLabel}>Mnemônicos Decodificados</label>
            <div className={styles.codeStack}>
                {result.map((line, i) => (
                    <div key={i} className={styles.codeLine}>
                        <span className={styles.lineNumber}>{i + 1}</span>
                        <code>{line}</code>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  )
}