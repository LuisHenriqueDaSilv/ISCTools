
import styles from './Select.module.scss';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string | number; label: string | number }[];
    error?: string;
}

export const Select = ({ label, options, error, className = '', ...props }: SelectProps) => {
    return (
        <div className={`${styles.selectWrapper} ${className}`}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.selectContainer}>
                <select
                    className={`${styles.select} ${error ? styles.error : ''}`}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};
