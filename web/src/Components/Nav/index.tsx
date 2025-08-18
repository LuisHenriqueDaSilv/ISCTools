import styles from './styles.module.scss'

export default function Nav(){
    return (
        <div className={styles.navContainer}>

        <a href="/bases-numericas">
          <div>
            <img alt="icon 0b>0x" src="0b_0x.png"></img>
            <p>bases numéricas</p>
          </div>
        </a>
        <a href="/ieee754">
          <div>
            <img alt="icon 0b>0x" src="0b_0x.png"></img>
            <p>IEEE754</p>
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
        {/* <a href="/png-to-data">
          <div>
            <img alt="icon 0b>0x" src="0b_0x.png"></img>
            <p>PNG para .data</p>
          </div>
        </a> */}
        <a href="/sobre">
          <div>
            <img alt="icon 0b>0x" src="0b_0x.png"></img>
            <p>sobre</p>
          </div>
        </a>

      </div>
    )
}