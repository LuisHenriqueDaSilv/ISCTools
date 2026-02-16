
import { useEffect } from 'react';
import styles from './styles.module.scss'
import { Card } from '../../Components/UI/Card'
import { Button } from '../../Components/UI/Button'
import { Github, Linkedin, Instagram } from 'lucide-react'

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
          <h2>Desenvolvido por</h2>

          <div className={styles.profile}>
            <img src="/luissilva.png" alt="Luis Silva" className={styles.devAvatar} />
            <div className={styles.devInfo}>
              <h4>Luis Silva</h4>
              <div className={styles.socialLinks}>
                <a href="https://github.com/LuisHenriqueDaSilv" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Github size={18} style={{ marginRight: '0.5rem' }} /> GitHub
                  </Button>
                </a>
                <a href="https://www.linkedin.com/in/luishenriquedasilv" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Linkedin size={18} style={{ marginRight: '0.5rem' }} /> LinkedIn
                  </Button>
                </a>
                <a href="https://www.instagram.com/luishenri.silva/" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <Instagram size={18} style={{ marginRight: '0.5rem' }} /> Instagram
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </Card>
    </div>
  )
}