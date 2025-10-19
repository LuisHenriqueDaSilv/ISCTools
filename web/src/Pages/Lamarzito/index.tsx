import styles from "./styles.module.scss"

export default function Lamarzito(){
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <img className={styles.lamarzitoIcon} src="/lamar2.png"/>
                <div className={styles.infos}>
                    <h1>Ajude este projeto a se manter online</h1>

                    <p>Manter o Lamarzito disponível requer custos com servidores, infraestrutura, LLM's, etc.</p>
                    <p>Se este projeto tem te ajudado de alguma forma, considere contribuir com qualquer valor via PIX.</p>
                    <p>Sua ajuda é essencial para manter o projeto no ar e acessível a todos. 💙</p>
                </div>
                <img className={styles.qrCode} src="/qrcode.svg"/>
            </header>
            <div className={styles.chatContainer}>
                chat
            </div>
        </div>
    )
}