import { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { NavLink, useLocation } from 'react-router-dom';
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
  PanelLeft,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

interface NavProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const navItems = [
  { to: '/lamarzito', label: 'Lamarzito-Tutor', icon: <Bot size={20} /> },
  { to: '/bases-numericas', label: 'Bases Numéricas', icon: <Binary size={20} /> },
  { to: '/ieee754', label: 'IEEE754', icon: <Cpu size={20} /> },
  { to: '/immediato', label: 'Immediato', icon: <Zap size={20} /> },
  { to: '/disassembler', label: 'Disassembler', icon: <FileCode size={20} /> },
  { to: '/assembler', label: 'Assembler', icon: <Package size={20} /> },
  { to: '/sobre', label: 'Sobre', icon: <Info size={20} /> },
];

export default function Nav({ collapsed, onToggleCollapsed, isDarkMode, onToggleDarkMode }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navItem} ${isActive ? styles.active : ''}`;

  return (
    <div className={styles.navRoot}>
      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de ferramentas'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className={styles.mobileTitle}>ISCTools</span>
      </header>

      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          aria-hidden
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        id="mobile-nav-drawer"
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={styles.mobileDrawerInner}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <LayoutDashboard size={24} color="#FFF" />
            </div>
            <span className={styles.logoText}>ISCTools</span>
          </div>
          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileMenuOpen(false)}>
                <span className={styles.iconWrapper}>{item.icon}</span>
                <span className={styles.labelText}>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className={styles.mobileDrawerFooter}>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
              aria-label={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className={styles.toggleLabel}>{isDarkMode ? 'Modo claro' : 'Modo escuro'}</span>
            </button>
          </div>
        </div>
      </div>

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
              className={linkClass}
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
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
            aria-label={isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className={styles.toggleLabel}>{isDarkMode ? 'Modo claro' : 'Modo escuro'}</span>
          </button>
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
    </div>
  );
}
