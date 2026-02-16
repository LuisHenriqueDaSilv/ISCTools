
import { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { converterBase } from '../../api/baseConverter'
// UI Components
import { Card } from '../../Components/UI/Card'
import { Input } from '../../Components/UI/Input'
import { Select } from '../../Components/UI/Select'
import { Button } from '../../Components/UI/Button'

export default function BasesNumericas() {

  const [originalNumber, setOriginalNumber] = useState("")
  const [base, setBase] = useState('2')
  const [targetBase, setTargetBase] = useState('2')
  const [originComp, setOriginComp] = useState(false)
  const [targetComp, setTargetComp] = useState(false)
  const [precision, setPrecision] = useState('8')
  const [result, setResult] = useState('')

  function convert(event: React.FormEvent) {
    event.preventDefault()
    try {
      const result = converterBase(originalNumber.toUpperCase().trim(), parseInt(base), parseInt(targetBase), originComp, targetComp, parseInt(precision))
      setResult(result)
    } catch (error) {
      setResult(`${error}`)
    }
  }

  useEffect(() => {
    // Optional: auto-scroll or focus could go here
  }, [])

  // Helper to generate options
  const baseOptions = Array.from({ length: 35 }, (_, i) => ({
    value: i + 2,
    label: (i + 2).toString()
  }));

  const precisionOptions = Array.from({ length: 32 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString()
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Conversor de Bases Numéricas</h1>
        <p>
          Converta números inteiros e fracionários entre diferentes bases (binário, octal, decimal, hexadecimal e mais).
        </p>
      </header>

      <div className={styles.contentGrid}>
        <Card className={styles.formCard}>
          <form onSubmit={convert} className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Número Original"
                value={originalNumber}
                onChange={(e) => setOriginalNumber(e.target.value)}
                placeholder="Ex: 1010, A1F, 255"
              />
            </div>

            <div className={styles.row}>
              <Select
                label="Base Origem"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                options={baseOptions}
              />
              <Select
                label="Base Destino"
                value={targetBase}
                onChange={(e) => setTargetBase(e.target.value)}
                options={baseOptions}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.toggleGroup}>
                <label>Origem em Complemento?</label>
                <div className={styles.toggles}>
                  <Button
                    type="button"
                    variant={!originComp ? 'secondary' : 'ghost'}
                    className={!originComp ? styles.activeToggle : ''}
                    onClick={() => setOriginComp(false)}
                    size="sm"
                  >Não</Button>
                  <Button
                    type="button"
                    variant={originComp ? 'secondary' : 'ghost'}
                    className={originComp ? styles.activeToggle : ''}
                    onClick={() => setOriginComp(true)}
                    size="sm"
                  >Sim</Button>
                </div>
              </div>

              <div className={styles.toggleGroup}>
                <label>Resultado em Complemento?</label>
                <div className={styles.toggles}>
                  <Button
                    type="button"
                    variant={!targetComp ? 'secondary' : 'ghost'}
                    className={!targetComp ? styles.activeToggle : ''}
                    onClick={() => setTargetComp(false)}
                    size="sm"
                  >Não</Button>
                  <Button
                    type="button"
                    variant={targetComp ? 'secondary' : 'ghost'}
                    className={targetComp ? styles.activeToggle : ''}
                    onClick={() => setTargetComp(true)}
                    size="sm"
                  >Sim</Button>
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <Select
                label="Precisão do Resultado"
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                options={precisionOptions}
              />
            </div>

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