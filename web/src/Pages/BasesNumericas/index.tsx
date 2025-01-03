import { useEffect, useState } from 'react'
import styles from './styles.module.scss'

import {converterBase} from '../../api/baseConverter'

export default function BasesNumericas() {

  const [originalNumber, setOriginalNumber] = useState("")
  const [base, setBase] = useState('2')
  const [targetBase, setTargetBase] = useState('2')
  const [originComp, setOriginComp] = useState(false)
  const [targetComp, setTargetComp] = useState(false)
  const [precision, setPrecision] = useState('8')
  const [result, setResult] = useState('')

  function convert(event: FormDataEvent) {
    event.preventDefault()
    try {
      const result = converterBase(originalNumber, base, targetBase, originComp, targetComp, precision)
      setResult(result)
    } catch (error) {
      setResult(`${error}`)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth', // Define a rolagem suave
      });
    }, 100)
  }, [])

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>conversor de bases numéricas</h1>
        <p>
          Esta calculadora permite converter números de uma base numérica para outra de forma simples e eficiente. Para utilizá-la,
          insira o número que deseja converter, a base na qual ele está representado e a base para a qual deseja convertê-lo.
        </p>
      </header>

      {/*@ts-ignore*/}
      <form onSubmit={convert}>

        <div>
          <label>numero original:</label>
          <input
            type="text"
            onChange={(event) => setOriginalNumber(event.target.value)}
            value={originalNumber}
          />
        </div>

        <div>
          <label>base:</label>

          <select
            onChange={(choice) => setBase(choice.target.value)}
            value={base}
          >
            {Array.from({ length: 35 }, (_, i) => (
              <option key={i + 2} value={i + 2}>
                {i + 2}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>base destino:</label>
          <select
            onChange={(event) => setTargetBase(event.target.value)}
            value={targetBase}
          >
            {Array.from({ length: 35 }, (_, i) => (
              <option key={i + 2} value={i + 2}>
                {i + 2}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>origem em complemento?</label>
          <div className={styles.buttonsContainer}>
            <button
              type="button"
              onClick={() => { setOriginComp(false) }}
              className={originComp ? '' : styles.selectedButton}
            >não</button>
            <button
              type="button"
              className={originComp ? styles.selectedButton : ''}
              onClick={() => { setOriginComp(true) }}
            >sim</button>

          </div>
        </div>
        <div>
          <label>resultado em complemento?</label>
          <div className={styles.buttonsContainer}>
            <button
              type="button"
              onClick={() => { setTargetComp(false) }}
              className={targetComp ? '' : styles.selectedButton}
            >não</button>
            <button
              type="button"
              className={targetComp ? styles.selectedButton : ''}
              onClick={() => { setTargetComp(true) }}
            >sim</button>
          </div>
        </div>
        <div>
          <label>precisao do resultado:</label>
          <select
            onChange={(event) => setPrecision(event.target.value)}
            value={precision}
          >
            {Array.from({ length: 32 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.submitButton} type="submit">converter</button>
      </form>

      <div className={styles.resultsContainer}>
        <label>resultado:</label>
        <h1>{result}</h1>
      </div>
    </div>
  )
}