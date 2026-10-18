import { Warning, GithubLogo } from '@phosphor-icons/react'
import styles from './styles.module.scss'

const GITHUB_URL = 'https://github.com/LuisHenriqueDaSilv'

export default function Lamarzito() {
    return (
        <div className={styles.loginGate}>
            <div className={`${styles.loginPrompt} ${styles.discontinuedNotice}`}>
                <div className={styles.loginIcon}><Warning size={26} /></div>
                <h3>O Lamarzito foi descontinuado</h3>
                <p>
                    Dada a baixa adesão e a falta de mão de obra para manutenção,
                    o projeto foi descontinuado.
                </p>
                <p>
                    Todo o sistema — o processo de <strong>ETL</strong>, a{' '}
                    <strong>transcrição das videoaulas</strong>, o <strong>embedding</strong> e{' '}
                    <strong>enriquecimento dos dados</strong> e o <strong>harness</strong> — está
                    disponível abertamente no GitHub, nos repositórios com o
                    prefixo <strong>"ISCTools"</strong>.
                </p>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.loginLink}>
                    <GithubLogo size={18} weight="bold" /> Ver no GitHub
                </a>
            </div>
        </div>
    )
}
