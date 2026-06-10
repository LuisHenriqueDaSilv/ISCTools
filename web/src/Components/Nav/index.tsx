import { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Robot,
  Hash,
  Cpu,
  Lightning,
  FileCode,
  Package,
  Info,
  SquaresFour,
  SidebarSimple,
  List,
  X,
  SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';

interface NavProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const navItems = [
  { to: '/lamarzito', label: 'Lamarzin', icon: <Robot size={20} /> },
  { to: '/bases-numericas', label: 'Bases Numéricas', icon: <Hash size={20} /> },
  { to: '/ieee754', label: 'IEEE754', icon: <Cpu size={20} /> },
  { to: '/immediato', label: 'Immediato', icon: <Lightning size={20} /> },
  { to: '/disassembler', label: 'Disassembler', icon: <FileCode size={20} /> },
  { to: '/assembler', label: 'Assembler', icon: <Package size={20} /> },
  { to: '/sobre', label: 'Sobre', icon: <Info size={20} /> },
];

function UserSection({ collapsed }: { collapsed?: boolean }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className={styles.userSection}>
      <div className={`${styles.userInfo} ${collapsed ? styles.userInfoCollapsed : ''}`}>
        {user.picture ? (
          <img src={user.picture} alt={user.name ?? user.email} className={styles.userAvatar} referrerPolicy="no-referrer" />
        ) : (
          <div className={styles.userAvatarInitials}>{initials}</div>
        )}
        {!collapsed && (
          <span className={styles.userName}>{user.name ?? user.email}</span>
        )}
      </div>
      <button
        type="button"
        className={`${styles.toggleButton} ${styles.logoutButton}`}
        onClick={logout}
        title="Sair"
        aria-label="Sair da conta"
      >
        <SignOut size={18} />
        {!collapsed && <span className={styles.toggleLabel}>Sair</span>}
      </button>
    </div>
  );
}

export default function Nav({ collapsed, onToggleCollapsed }: NavProps) {
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
          {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
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
              <SquaresFour size={22} weight="fill" color="var(--dracula-purple)" />
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
            <UserSection />
          </div>
        </div>
      </div>

      <nav className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <SquaresFour size={22} weight="fill" color="var(--dracula-purple)" />
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
          <UserSection collapsed={collapsed} />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            <SidebarSimple size={18} />
            <span className={styles.toggleLabel}>Recolher menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
