import { Link, useLocation } from 'react-router-dom';
import { ChatIcon, FlameIcon, HeartIcon, PersonIcon } from './Icons';

const tabs = [
  { to: '/discover', label: 'Discover', icon: FlameIcon },
  { to: '/matches', label: 'Matches', icon: HeartIcon },
  { to: '/messages', label: 'Messages', icon: ChatIcon },
  { to: '/profile', label: 'Profile', icon: PersonIcon },
] as const;

const TabBar = () => {
  const location = useLocation();

  return (
    <nav className="tab-bar" aria-label="Main">
      {tabs.map((tab) => {
        const active =
          location.pathname === tab.to ||
          (tab.to === '/messages' && location.pathname.startsWith('/messages'));
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`tab-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={24} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default TabBar;
