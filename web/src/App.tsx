import 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import styles from "./styles/AppStyles.module.scss"
import BasesNumericas from './Pages/BasesNumericas'
import Immediato from './Pages/Immediato'
import Disassembler from './Pages/Disassembler'
import Assembler from './Pages/assembler'
import About from './Pages/About'
import IEEE754 from './Pages/IEEE754'
import Nav from './Components/Nav'
import Lamarzito from './Pages/Lamarzito'
// import PNGConverter from './Pages/PngConverter'

const Layout = () => {
  return (
    <div className={styles.appLayout}>
      <Nav />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/bases-numericas", element: <BasesNumericas /> },
      { path: "/immediato", element: <Immediato /> },
      { path: "/disassembler", element: <Disassembler /> },
      { path: "/assembler", element: <Assembler /> },
      { path: "/sobre", element: <About /> },
      { path: "/", element: <About /> },
      { path: "/ieee754", element: <IEEE754 /> },
      { path: "/lamarzito", element: <Lamarzito /> }
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
