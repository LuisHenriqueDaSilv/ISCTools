"use client";
import { useLayoutEffect, useRef, useState } from 'react';
import { FileCode, Play } from 'lucide-react';
import styles from './styles.module.scss'
import { assembler } from '@/api/assembler';

export default function Assembler() {

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
    const ans = assembler(instructions, parseInt(base))
    setResult(ans)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
            <FileCode className={styles.icon} size={24} />
            <h1>Assembler RISC-V</h1>
        </div>
        <p>Traduza mnemônicos de Assembly para padrões binários ou hexadecimais executáveis.</p>
      </header>

      <form onSubmit={convert} className={styles.toolForm}>
        <div className={styles.inputGroup}>
          <label>Código Fonte (Instruções por linha)</label>
          <textarea
            ref={textbox}
            placeholder="addi x1, x0, 10&#10;slli x2, x1, 2"
            onChange={handleKeyDown}
            className={styles.assemblerTextarea}
          />
        </div>

        <div className={styles.bottomRow}>
            <div className={styles.inputGroup}>
                <label>Codificação de Saída</label>
                <select onChange={(e) => setBase(e.target.value)} value={base}>
                    <option value={16}>Hexadecimal</option>
                    <option value={2}>Binário</option>
                </select>
            </div>
            <button className={styles.submitButton} type="submit">
                <Play size={16} fill="currentColor" />
                Montar Código
            </button>
        </div>
      </form>

      {result.length > 0 && (
        <div className={styles.resultsArea}>
            <label>Saída em Linguagem de Máquina</label>
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