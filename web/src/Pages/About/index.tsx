
import { useEffect } from 'react';
import styles from './styles.module.scss'
import { Card } from '../../Components/UI/Card'
import { Button } from '../../Components/UI/Button'
import { GithubLogo, LinkedinLogo, InstagramLogo, GitFork } from '@phosphor-icons/react'

export default function About() {

  useEffect(() => {
    // Optional: focus or scroll
  }, [])

  return (
    <div className={styles.container}>
      <Card className={styles.contentCard}>
        <div className={styles.header}>
          <img className={styles.avatar} alt="Lamarzito" src="/lamar1.png" />
          <div className={styles.titleSection}>
            <h1>ISC TOOLS</h1>
            <span className={styles.subtitle}>Feito por alunos, para alunos.</span>
          </div>
        </div>

        <article className={styles.article}>
          <p>
            O <strong>ISC Tools</strong> é o seu aliado nos desafios da matéria de Introdução aos Sistemas
            Computacionais (ISC) da UnB! Aqui você encontra calculadoras e conversores para tornar os estudos mais práticos e dinâmicos.
          </p>
          <div className={styles.alertBox}>
            <strong>⚠️ Nota Importante:</strong> Este site não é oficial e não tem vínculo com a UnB.
            É uma iniciativa independente para facilitar a jornada, não para substituir o aprendizado.
          </div>
          <p>
            Aproveite as ferramentas, estude com responsabilidade e siga firme no caminho do conhecimento! 🚀
          </p>
        </article>

        <div className={styles.divider} />

        <section className={styles.devSection}>
          <h2>Mantido por</h2>

          <div className={styles.profile}>
            <img src="/luissilva.png" alt="Luis Silva" className={styles.devAvatar} />
            <div className={styles.devInfo}>
              <h4>Luis Silva</h4>
              <div className={styles.socialLinks}>
                <a href="https://github.com/LuisHenriqueDaSilv" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <GithubLogo size={16} /> GitHub
                  </Button>
                </a>
                <a href="https://www.linkedin.com/in/luishenriquedasilv" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <LinkedinLogo size={16} /> LinkedIn
                  </Button>
                </a>
                <a href="https://www.instagram.com/luishenri.silva/" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <InstagramLogo size={16} /> Instagram
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.opensourceSection}>
          <div className={styles.opensourceIcon}>
            <GitFork size={28} weight="duotone" />
          </div>
          <div className={styles.opensourceContent}>
            <h3>Projeto Open Source</h3>
            <p>
              O ISC Tools é aberto à comunidade! Contribuições de todos são bem-vindas —
              seja corrigindo bugs, sugerindo melhorias ou adicionando novas ferramentas.
            </p>
            <div className={styles.repoLinks}>
              <a href="https://github.com/LuisHenriqueDaSilv/ISCTools" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <GithubLogo size={16} /> Frontend
                </Button>
              </a>
              <a href="https://github.com/LuisHenriqueDaSilv/ISCTools-backend" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <GithubLogo size={16} /> Backend
                </Button>
              </a>
            </div>
          </div>
        </section>
      </Card>
    </div>
  )
}