'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserGroupIcon,
  HomeIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Cadastro de Usuários', href: '/usuarios', icon: UserPlusIcon },
  { name: 'Porteiros', href: '/porteiros', icon: UserGroupIcon },
  { name: 'Pátio', href: '/patio', icon: UserGroupIcon },
  { name: 'Coleta', href: '/coleta', icon: ClipboardDocumentListIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 bg-gray-800">
      <div className="flex h-16 items-center justify-center bg-gray-900">
        <h1 className="text-white text-xl font-bold">Sistema de Controle</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 