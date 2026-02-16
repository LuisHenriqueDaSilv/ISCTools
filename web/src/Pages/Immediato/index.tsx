
import { useState } from "react";
import styles from './styles.module.scss'
import { immeCalc } from "../../api/immeCalc";
import { Card } from '../../Components/UI/Card'
import { Input } from '../../Components/UI/Input'
import { Select } from '../../Components/UI/Select'
import { Button } from '../../Components/UI/Button'

export default function Immediato() {

  const [selectedFmts, setSelectedFmts] = useState('B');
  const [selectedInputType, setSelectedInputType] = useState('byte');
  const [numberInput, setNumberInput] = useState('');
  const [base, setBase] = useState('1');
  const [result, setResult] = useState('');


  function calc(event: React.FormEvent) {
    event.preventDefault()
    try {
      const result_ = immeCalc(numberInput.toUpperCase().trim(), selectedFmts, selectedInputType, parseInt(base));
      setResult(result_)
    } catch (error) {
      setResult(`${error}`);
    }
  }

  const fmtOptions = [
    { value: 'B', label: 'Operações tipo B (Branch)' },
    { value: 'J', label: 'Operações tipo J (JAL)' }
  ];

  const inputTypeOptions = [
    { value: 'byte', label: 'Distância em bytes' },
    { value: 'operacoes', label: 'Quantidade de Instruções (Words)' }
  ];

  const baseOptions = Array.from({ length: 35 }, (_, i) => ({
    value: i + 2,
    label: (i + 2).toString()
  }));


  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>Calculadora de Imediato (RISC-V)</h1>
        <p>
          Calcule o valor imediato para instruções JAL e Branch em RISC-V.
        </p>
      </header>

      <div className={styles.contentGrid}>
        <Card className={styles.formCard}>
          <form onSubmit={calc} className={styles.form}>

            <div className={styles.row}>
              <Select
                label="Operação Desejada"
                value={selectedFmts}
                onChange={(e) => setSelectedFmts(e.target.value)}
                options={fmtOptions}
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Número (Sinal/Magnitude)"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder="Ex: 100, -8, 0xFF"
              />
            </div>

            <div className={styles.row}>
              <Select
                label="O número informado é:"
                value={selectedInputType}
                onChange={(e) => setSelectedInputType(e.target.value)}
                options={inputTypeOptions}
              />
              <Select
                label="Base do número informado:"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                options={baseOptions}
              />
            </div>

            <Button type="submit" size="lg" className={styles.submitBtn}>
              Calcular Imediato
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