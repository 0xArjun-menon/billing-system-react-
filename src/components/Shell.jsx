import { NavLink, Outlet } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  DashboardIcon,
  BillingIcon,
  ProductsIcon,
  CustomersIcon,
  HistoryIcon,
  ReportsIcon
} from './Icons';

const navItems = [
  { label: 'Dashboard', icon: DashboardIcon, to: '/' },
  { label: 'Billing', icon: BillingIcon, to: '/billing' },
  { label: 'Products', icon: ProductsIcon, to: '/products' },
  { label: 'Customers', icon: CustomersIcon, to: '/customers' },
  { label: 'Billing History', icon: HistoryIcon, to: '/billing-history' },
  { label: 'Reports', icon: ReportsIcon, to: '/reports' }
];

export default function Shell() {
  return (
    <div className="shell">
      <aside className="icon-rail no-print">
        <img
  src={logo}
  alt="Ruchi - Kerala Meals & More"
  className="brand-icon"
  width={38}
  height={38}
/>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', alignItems: 'center' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => 'rail-link' + (isActive ? ' active' : '')}
            >
              <item.icon />
              <span className="rail-tooltip">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="topbar no-print">
          <span className="topbar-title">Onam Sadhya &amp; Curry — Point of Sale</span>
          <span className="topbar-spacer" />
          <span className="topbar-tag">Onam Season 2026</span>
        </header>

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}