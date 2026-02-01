"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Binary, Cpu, Calculator, Hash, Info, FileCode, Bot } from 'lucide-react';
import styles from './styles.module.scss'

export default function Nav(){
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={styles.navContainer}>
            <div className={styles.logo}>ISC TOOLS</div>

            <Link href="/lamarzito" className={isActive('/lamarzito') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <Bot />
                    <p>Lamarzito</p>
                </div>
            </Link>

            <Link href="/bases-numericas" className={isActive('/bases-numericas') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <Hash />
                    <p>Bases Numéricas</p>
                </div>
            </Link>

            <Link href="/ieee754" className={isActive('/ieee754') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <Calculator />
                    <p>Conversor IEEE 754</p>
                </div>
            </Link>

            <Link href="/immediato" className={isActive('/immediato') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <Cpu />
                    <p>Cálculo de Imediato</p>
                </div>
            </Link>

            <Link href="/assembler" className={isActive('/assembler') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <FileCode />
                    <p>Assembler RISC-V</p>
                </div>
            </Link>

            <Link href="/disassembler" className={isActive('/disassembler') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <Binary />
                    <p>Disassembler</p>
                </div>
            </Link>

            <Link href="/sobre" className={isActive('/sobre') ? styles.active : ''}>
                <div className={styles.navItem}>
                    <Info />
                    <p>Sobre o Projeto</p>
                </div>
            </Link>
        </nav>
    )
}