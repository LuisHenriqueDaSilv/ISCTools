import 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import styles from "./styles/AppStyles.module.scss"
import BasesNumericas from './Pages/BasesNumericas'
import Immediato from './Pages/Immediato'
import Disassembler from './Pages/Disassembler'
import Assembler from './Pages/assembler'
import About from './Pages/About'

const router = createBrowserRouter([
  {
    path: "/bases-numericas",
    element: <BasesNumericas />
  },
  {
    path: "/immediato",
    element: <Immediato />
  },
  {
    path: "/disassembler",
    element: <Disassembler />
  },
  {
    path: "/assembler",
    element: <Assembler />
  },
  {
    path: "/sobre",
    element: <About />
  },
  {
    path: "/",
    element: <About />
  }
])

function App() {

  return (
    <div className={styles.appContainer}>
        <div className={styles.homeContainer}>

          <div className={styles.toolsSelector}>

            <a href="/bases-numericas">
              <div>
                <img alt="icon 0b>0x" src="0b_0x.png"></img>
                <p>bases numéricas</p>
              </div>
            </a>
            <a href="/immediato">
              <div>
                <img alt="icon 0b>0x" src="0b_0x.png"></img>
                <p>Immediato</p>
              </div>
            </a>
            <a href="/disassembler">
              <div>
                <img alt="icon 0b>0x" src="0b_0x.png"></img>
                <p>Disassembler</p>
              </div>
            </a>
            <a href="/assembler">
              <div>
                <img alt="icon 0b>0x" src="0b_0x.png"></img>
                <p>Assembler</p>
              </div>
            </a>
            <a href="/sobre">
              <div>
                <img alt="icon 0b>0x" src="0b_0x.png"></img>
                <p>sobre</p>
              </div>
            </a>

          </div>
        </div>
        <RouterProvider router={router} />

    </div >
  )
}

export default App
