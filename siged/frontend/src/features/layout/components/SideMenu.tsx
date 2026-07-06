import { useState } from 'react';

const menuItems = [
  { icon: 'home', label: 'Inicio', path: '/' },
];

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('/');

  return (
    <aside
      className={`bg-sidebar text-white flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">
            {isOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              setActiveItem(item.path);
            }}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
              activeItem === item.path
                ? 'bg-sidebar-active text-white'
                : 'hover:bg-sidebar-hover text-white/90'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}
