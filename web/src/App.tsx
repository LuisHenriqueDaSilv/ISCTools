import 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import styles from "./styles/AppStyles.module.scss"
import BasesNumericas from './Pages/BasesNumericas'

const router = createBrowserRouter([
  {
    path: "/bases-numericas",
    element: <BasesNumericas/>
  },
  {
    path: "/",
    element: <></>
  }
])

function App() {

  return (
    <div className={styles.appContainer}>
      <div className={styles.homeContainer}>

        <div className={styles.bannerWrapper}>
          <div className={styles.bannerContainer}>
            <img className={styles.person} alt="personagem cartoon" src="/lamar1.png" />
            <div className={styles.infosContainer}>
              <article>
                <h1>ISC TOOLS</h1>
                <p>
                  <strong>Feito por alunos e para alunos</strong>, o ISC Tools é o seu aliado nos desafios da matéria de Introdução aos Sistemas
                  Computacionais (ISC) da UnB! Aqui você encontra calculadoras e conversores para tornar os estudos mais práticos e dinâmicos.
                </p>
                <p>
                  <strong>Mas atenção! Este site não é oficial</strong> e não tem qualquer vínculo com a UnB. O ISC Tools é uma iniciativa independente, criada para
                  ajudar nos seus estudos, mas nunca para substituir o aprendizado. Nosso objetivo é facilitar a jornada, não pular etapas.
                  É fundamental entender os conceitos e o “porquê” de cada conversão — afinal, nada substitui a boa e velha prática!
                </p>
                <p>
                  Aproveite as ferramentas, estude com responsabilidade e siga firme no caminho do conhecimento! 🚀
                </p>
              </article>

              <section className={styles.devContainer}>
                <h2>Desenvolvido e mantido por Luis H. Silva</h2>
                <div className={styles.networkContainer}>
                  <a href='https://www.linkedin.com/in/luishenriquedasilv' target='_blank'><img src="/linkedin.png" alt="linkedin" /></a>
                  <a href='https://github.com/LuisHenriqueDaSilv' target='_blank'><img src="/github.png" alt="github" /></a>
                  <a href='https://www.instagram.com/luishenri.silva/' target='_blank'><img src="/instagram.png" alt="instagram" /></a>
                </div>
              </section>

            </div>
          </div>
        </div>

        <div className={styles.toolsSelector}>

          <a href="/bases-numericas">
            <div>
              <img alt="icon 0b>0x" src="0b_0x.png"></img>
              <p>bases numéricas</p>
            </div>
          </a>
          <a href="https://google.com">
            <div>
              <img alt="icon 0b>0x" src="0b_0x.png"></img>
              <p>calculadora de immediato</p>
            </div>
          </a>
          <a href="https://google.com">
            <div>
              <img alt="icon 0b>0x" src="0b_0x.png"></img>
              <p>assembly para código de máquina</p>
            </div>
          </a>
          <a href="https://google.com">
            <div>
              <img alt="icon 0b>0x" src="0b_0x.png"></img>
              <p>código de maquina para assembly</p>
            </div>
          </a>
        </div>
      </div>
      <RouterProvider router={router} />

    </div>
  )
}

export default App
