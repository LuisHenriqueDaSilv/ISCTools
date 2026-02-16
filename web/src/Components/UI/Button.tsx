import styles from './Button.module.scss';
import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'cta';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}: ButtonProps) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
