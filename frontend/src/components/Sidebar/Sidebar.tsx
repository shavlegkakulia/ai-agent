import { NavLink } from 'react-router-dom';

const links = [
  { to: '/chats', label: 'Chat' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/customers', label: 'Customers' },
  { to: '/documents', label: 'Documents' },
  { to: '/chunks', label: 'Chunks' },
  { to: '/outbox', label: 'Outbox' },
  { to: '/eval-dataset', label: 'Eval Dataset Generation' },
  { to: '/profile', label: 'Profile' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">AI Backend</div>
      <nav className="nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
