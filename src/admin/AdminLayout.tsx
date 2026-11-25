import {
  BarChart3,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  PlusSquare,
  Settings,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLoginPage from './AdminLoginPage';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Add Plot', to: '/admin/add-plot', icon: PlusSquare },
  { label: 'Manage Plots', to: '/admin/manage-plots', icon: Layers },
  { label: 'Plot Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Sales Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">
        Loading admin workspace...
      </div>
    );
  }

  if (!admin) {
    return <AdminLoginPage />;
  }

  const activeNav = ADMIN_NAV.find((n) => location.pathname.startsWith(n.to));

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1F3A] text-white">
      <div className="px-5 h-16 flex items-center justify-between border-b border-white/10">
        <div className="font-display font-bold text-base tracking-tight text-white">
          JHS <span className="text-amber-400">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-[#07162B] font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>View Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-64 h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/50" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin sidebar"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-500 truncate">
              Admin <span className="mx-1.5 text-slate-300">/</span>{' '}
              <span className="font-display font-semibold text-[#0B1F3A]">
                {activeNav?.label || 'Console'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#0B1F3A]">{admin.name}</div>
              <div className="text-[11px] text-slate-500">{admin.email}</div>
            </div>
            <Link
              to="/admin/add-plot"
              className="px-3.5 py-2 rounded-lg bg-[#0B1F3A] hover:bg-[#112D54] text-white text-xs font-semibold whitespace-nowrap transition-colors"
            >
              + Add Plot
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
