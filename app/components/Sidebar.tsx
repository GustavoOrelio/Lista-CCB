'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { toast } from 'sonner';
import {
  HomeIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  requiresAdmin?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Igrejas', href: '/igrejas', icon: BuildingOffice2Icon, requiresAdmin: true },
  { name: 'Voluntários', href: '/voluntarios', icon: UserPlusIcon },
  { name: 'Cargos', href: '/cargos', icon: BriefcaseIcon },
  { name: 'Escalas', href: '/escalas', icon: CalendarDaysIcon },
  { name: 'Usuários', href: '/usuarios', icon: UsersIcon, requiresAdmin: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isAdmin } = usePermissions();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      toast.success('Logout realizado com sucesso!');
    } catch {
      toast.error('Erro ao fazer logout.');
    }
  };

  // Filtra os itens do menu baseado nas permissões do usuário
  const filteredMenuItems = menuItems.filter(item => !item.requiresAdmin || isAdmin);

  // Sidebar content
  const sidebarContent = (
    <div className="flex h-full w-64 flex-col bg-background border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border justify-between">
        <h1 className="text-foreground text-lg font-medium">Sistema CCB</h1>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-md transition-all"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fixo para desktop */}
      <div className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 z-30">
        {sidebarContent}
      </div>

      {/* Drawer para mobile usando Sheet do shadcn/ui */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-40 bg-white border border-gray-200 shadow"
              aria-label="Abrir menu"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Menu lateral</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Adicione a animação no seu CSS global ou Tailwind config:
// .animate-slide-in-left { animation: slide-in-left 0.2s cubic-bezier(0.4,0,0.2,1) both; }
// @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } } 