
import styles from "./styles.module.scss"
import { Card } from '../../Components/UI/Card'

export default function Lamarzito() {
    return (
        <div className={styles.container}>


            <Card className={styles.chatCard}>
                <div className={styles.chatPlaceholder}>
                    <h3>Lamarzito Chat</h3>
                    <p>Em breve você poderá conversar com o tutor aqui.</p>
                </div>
            </Card>
        </div>
    )
}