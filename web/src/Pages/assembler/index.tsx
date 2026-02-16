
import { useLayoutEffect, useRef, useState } from 'react';
import styles from './styles.module.scss'
import { assembler } from '../../api/assembler';
import { Card } from '../../Components/UI/Card'
import { Select } from '../../Components/UI/Select'
import { Button } from '../../Components/UI/Button'
import { Textarea } from '../../Components/UI/Textarea'

export default function Assembler() {

  const [instructions, setInstructions] = useState('');
  const [base, setBase] = useState('2');
  const [result, setResult] = useState<string[]>([]);
  const textbox = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    if (textbox.current) {
      textbox.current.style.height = "inherit";
      textbox.current.style.height = `${textbox.current.scrollHeight}px`;
    }
  }

  useLayoutEffect(() => {
    adjustHeight();
  }, []);

  function handleKeyDown(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInstructions(event.target.value)
    adjustHeight();
  }

  function convert(event: React.FormEvent) {
    event.preventDefault()
    const ans = assembler(instructions, parseInt(base))
    setResult(ans)
  }

  const baseOptions = [
    { value: 2, label: '2 (Binário)' },
    { value: 16, label: '16 (Hexadecimal)' }
  ];

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>Assembler RISC-V</h1>
        <p>
          Converta Assembly RISC-V para código de máquina.
        </p>
      </header>

      <div className={styles.contentGrid}>
        <Card className={styles.formCard}>
          <form onSubmit={convert} className={styles.form}>
            <div className={styles.row}>
              <Select
                label="Base do Resultado"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                options={baseOptions}
              />
            </div>

            <div className={styles.row}>
              <Textarea
                ref={textbox}
                label="Instruções Assembly (Uma por linha)"
                onChange={handleKeyDown}
                placeholder="Ex: add t1, t2, t3"
                style={{ minHeight: '200px' }}
              />
            </div>

            <Button type="submit" size="lg" className={styles.submitBtn}>
              Gerar Código de Máquina
            </Button>
          </form>
        </Card>

        {result.length > 0 && (
          <Card className={styles.resultCard} variant="result">
            <label>Resultado</label>
            <div className={styles.resultList}>
              {result.map((line, index) => (
                <div key={index} className={styles.codeLine}>{line}</div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}