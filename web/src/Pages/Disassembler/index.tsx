import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './styles.module.scss'
import { disassembler } from '../../api/disassembler';

export default function Disassembler() {

  const [instructions, setInstructions] = useState('');
  const [base, setBase] = useState('');
  const [result, setResult] = useState<string[]>([]);

  const textbox = useRef(null);

  function adjustHeight() {
    //@ts-ignore
    textbox.current.style.height = "inherit";
    //@ts-ignore
    textbox.current.style.height = `${textbox.current.scrollHeight}px`;
  }

  useLayoutEffect(adjustHeight, []);

  function handleKeyDown(event: any) {
    setInstructions(event.target.value)
    adjustHeight();
  }

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }, 100)
  }, [])

  function convert(event: FormDataEvent) {
    event.preventDefault()
    const ans = disassembler(instructions, base)
    setResult(ans)
  }

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>Disassembler</h1>
        <p>
          Esta ferramenta permite converter código de máquina RISC-V em instruções legíveis de Assembly de forma simples e eficiente.
          Para utilizá-la, insira o código binário ou hexadecimal que deseja decodificar, e o disassembler transformará automaticamente
          os dados em instruções Assembly correspondentes, facilitando a análise e compreensão do funcionamento do programa.
        </p>
      </header>

      {/* @ts-ignore*/}
      <form onSubmit={convert}>

        <div>
          <label>instruções (Uma por linha):</label>
          <div>

            <textarea
              ref={textbox}
              onChange={handleKeyDown}
            />
          </div>
        </div>

        <div>
          <label>base das instruções:</label>
          <select
            onChange={(event) => setBase(event.target.value)}
            value={base}
          >
            {Array.from({ length: 35 }, (_, i) => (
              <option key={i + 2} value={i + 2}>
                {i + 2}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.submitButton} type="submit">gerar códigos</button>
      </form>

      <div className={styles.resultsContainer}>
        <label>resultado:</label>
        {
          result.map((line) => {
            return (
              <h1>{line}</h1>
            )
          })
        }
      </div>

    </div>
  )
}