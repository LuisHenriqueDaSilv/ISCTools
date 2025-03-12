import 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import styles from "./styles/AppStyles.module.scss"
import BasesNumericas from './Pages/BasesNumericas'
import Immediato from './Pages/Immediato'
import Disassembler from './Pages/Disassembler'
import Assembler from './Pages/assembler'
import About from './Pages/About'
import Nav from './Components/Nav'

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
      <Nav/>
      <RouterProvider router={router} />
    </div >
  )
}

export default App
