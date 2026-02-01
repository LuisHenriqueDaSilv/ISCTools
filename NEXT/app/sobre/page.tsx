"use client";
import { useEffect } from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';
import styles from './styles.module.scss'

export default function About() {

  useEffect(() => {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [])

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerContainer}>
        <div className={styles.visualSide}>
            <img className={styles.person} alt="Avatar" src="/lamar1.png" />
        </div>
        
        <div className={styles.infosContainer}>
          <article>
            <div className={styles.badge}>Projeto Independente</div>
            <h1>Ajudando alunos em ISC.</h1>
            <p>
              O ISC Tools é uma suíte de utilitários projetada para simplificar cálculos complexos para a matéria de 
              <strong> Introdução aos Sistemas Computacionais</strong> da UnB.
            </p>
            <p className={styles.disclaimer}>
              Este é um projeto independente para auxílio nos estudos e não possui vínculo oficial com a UnB.
            </p>
            
            <div className={styles.ctaArea}>
                <button 
                  className={styles.primaryButton}
                  onClick={() => window.location.href = '/bases-numericas'}
                >
                  Explorar Ferramentas
                </button>
            </div>
          </article>

          <section className={styles.devContainer}>
            <div className={styles.colaboradorCard}>
              <img src="/luissilva.png" alt="Luis Silva" className={styles.avatar} />
              <div className={styles.devInfo}>
                <p className={styles.label}>Desenvolvedor Principal</p>
                <h4>Luis Silva</h4>
                <div className={styles.socialIcons}>
                  <a href="https://github.com/LuisHenriqueDaSilv" target="_blank" rel="noopener noreferrer">
                    <Github size={18} />
                  </a>
                  <a href="https://www.linkedin.com/in/luishenriquedasilv" target="_blank" rel="noopener noreferrer">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://www.instagram.com/luishenri.silva/" target="_blank" rel="noopener noreferrer">
                    <Instagram size={18} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}