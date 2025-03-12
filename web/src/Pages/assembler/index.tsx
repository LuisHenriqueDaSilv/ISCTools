import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './styles.module.scss'
import { assembler } from '../../api/assembler';

export default function Assembler() {

  const [instructions, setInstructions] = useState('');
  const [base, setBase] = useState('2');
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
    const ans = assembler(instructions, parseInt(base))
    setResult(ans)
  }

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <h1>Assembler</h1>
        <p>
          Esta ferramenta permite converter código Assembly RISC-V para linguagem de máquina de forma simples e eficiente. Para utilizá-la, 
          insira a instrução Assembly que deseja converter, incluindo os registradores e valores imediatos. O assembler gerará automaticamente 
          o código binário correspondente, pronto para ser executado em um processador compatível com a ISA RISC-V.
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
          <label>base do resultado:</label>
          <select
            onChange={(event) => setBase(event.target.value)}
            value={base}
          >
              <option key={2} value={2}>
                2
              </option>
              <option key={16} value={16}>
                16
              </option>
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