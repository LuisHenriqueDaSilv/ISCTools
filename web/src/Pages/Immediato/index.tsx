import { useEffect, useState } from "react";
import styles from './styles.module.scss'
import { immeCalc } from "../../api/immeCalc";

const fmts = [
  "B",
  "J",
]

const inputTypes = [
  { key: "byte", message: "Distancia em bytes" },
  { key: "operacoes", message: "Quantidade de operações/Linhas" },

]
export default function Immediato() {

  const [selectedFmts, setSelectedFmts] = useState('B');
  const [selectedInputType, setSelectedInputType] = useState('byte');
  const [numberInput, setNumberInput] = useState('');
  const [base, setBase] = useState('1');
  const [result, setResult] = useState('');


  function calc(event: FormDataEvent) {
    event.preventDefault()
    try {
      const result_ = immeCalc(numberInput.toUpperCase().trim(), selectedFmts, selectedInputType, base);
      setResult(result_)
    } catch (error) {
      setResult(`${error}`);      
    }
  }

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }, 100)
  }, [])

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>Calculadora de Imediato para JAL e Branch em Assembly RISC-V</h1>
        <p>
          Esta ferramenta foi desenvolvida para calcular o valor imediato necessário em instruções de Jump and Link (JAL) e Branch em linguagem
          de máquina RISC-V. Para utilizá-la, insira o endereço de destino relativo ao ponto de salto e a operação desejada (JAL ou Branch).
          A calculadora irá gerar automaticamente o valor do imediato no formato correto, levando em consideração o deslocamento necessário
          para instruções de salto condicional ou incondicional no seu código Assembly RISC-V.
        </p>
      </header>
      {/*@ts-ignore*/}
      <form onSubmit={calc}>

        <div>
          <label>operação para qual deseja o imediato:</label>
          <select
            onChange={(choice) => setSelectedFmts(choice.target.value)}
            value={selectedFmts}
          >
            {
              fmts.map((fmt) => {
                return (
                  <option key={fmt} value={fmt}>
                    Operações do tipo {fmt}
                  </option>
                )
              })
            }
          </select>
        </div>

        <div>
          <label>numero (Em sinal/magnitude):</label>
          <input
            onChange={(event) => setNumberInput(event.target.value)}
            value={numberInput}
            type="text"
          />
        </div>

        <div>
          <label>o numero informado é:</label>
          <select
            onChange={(choice) => setSelectedInputType(choice.target.value)}
            value={selectedInputType}
          >
            {
              inputTypes.map((input) => {
                return (
                  <option key={input.key} value={input.key}>
                    {input.message}
                  </option>
                )
              })
            }
          </select>
        </div>

        <div>
          <label>base do numero informado:</label>
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

        <button className={styles.submitButton}>
          converter
        </button>

      </form>

      <div className={styles.resultsContainer}>
        <label>resultado:</label>
        <h1>{result}</h1>
      </div>
    </div>
  )
}