'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Igrejas', href: '/igrejas', icon: BuildingOffice2Icon },
  { name: 'Voluntários', href: '/voluntarios', icon: UserPlusIcon },
  { name: 'Cargos', href: '/cargos', icon: BriefcaseIcon },
  { name: 'Escalas', href: '/escalas', icon: CalendarDaysIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-gray-800 text-lg font-medium">Sistema CCB</h1>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'
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