
import styles from './Textarea.module.scss';
import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className={`${styles.textareaWrapper} ${className}`}>
                {label && <label className={styles.label}>{label}</label>}
                <textarea
                    ref={ref}
                    className={`${styles.textarea} ${error ? styles.error : ''}`}
                    {...props}
                />
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
