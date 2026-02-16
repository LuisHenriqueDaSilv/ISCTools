
import { ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'result';
}

export const Card = ({ children, className = '', onClick, variant = 'default' }: CardProps) => {
    return (
        <div
            className={`${styles.card} ${variant === 'result' ? styles.result : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
