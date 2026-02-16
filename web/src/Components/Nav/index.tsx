import styles from './styles.module.scss';
import { NavLink } from 'react-router-dom';
import {
  Bot,
  Binary,
  Cpu,
  Zap,
  FileCode,
  Package,
  Info,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

interface NavProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Nav({ collapsed, onToggleCollapsed }: NavProps) {
  const navItems = [
    { to: "/lamarzito", label: "Lamarzito-Tutor", icon: <Bot size={20} /> },
    { to: "/bases-numericas", label: "Bases Numéricas", icon: <Binary size={20} /> },
    { to: "/ieee754", label: "IEEE754", icon: <Cpu size={20} /> },
    { to: "/immediato", label: "Immediato", icon: <Zap size={20} /> },
    { to: "/disassembler", label: "Disassembler", icon: <FileCode size={20} /> },
    { to: "/assembler", label: "Assembler", icon: <Package size={20} /> },
    { to: "/sobre", label: "Sobre", icon: <Info size={20} /> },
  ];

  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <LayoutDashboard size={24} color="#FFF" />
        </div>
        <span className={styles.logoText}>ISCTools</span>
      </div>

      <div className={styles.navLinks}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.iconWrapper}>{item.icon}</span>
            <span className={styles.labelText}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expandir barra lateral' : 'Encolher barra lateral'}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Encolher barra lateral'}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          <span className={styles.toggleLabel}>Encolher menu</span>
        </button>
      </div>
    </nav>
  );
}