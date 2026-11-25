import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const PRIMARY_NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Plots', to: '/plots' },
  { label: 'Master Plan', to: '/master-plan' },
  { label: 'Contact', to: '/contact' },
];

const MOBILE_NAV = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Available Plots', to: '/plots' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Location', to: '/location' },
  { label: 'Master Plan', to: '/master-plan' },
  { label: 'Blocks', to: '/blocks' },
  { label: 'Development Updates', to: '/updates' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B1F3A] text-white border-b border-white/10">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded-md"
        >
          <svg
            viewBox="0 0 36 28"
            className="w-8 h-7 shrink-0 text-amber-400"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 16L18 3L34 16"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 14L18 5.5L29 14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
            <rect
              x="14"
              y="16"
              width="8"
              height="8"
              rx="1"
              fill="#FFFFFF"
              opacity="0.95"
            />
            <path d="M18 16V24M14 20H22" stroke="#0B1F3A" strokeWidth="1.4" />
          </svg>
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
            Juddi Housing Scheme
          </span>
        </Link>

        {/* Zone 2: Concise single-line desktop links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-amber-400 border-amber-400'
                    : 'text-slate-200 border-transparent hover:text-white hover:border-amber-400/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: 1 Primary CTA + Mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/plots"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#07162B] bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
          >
            Explore Plots
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#07162B] border-t border-white/10 px-4 py-4">
          <nav className="grid grid-cols-2 gap-2 text-sm">
            {MOBILE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-400/15 text-amber-400'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 pt-3 border-t border-white/10">
            <Link
              to="/plots"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg bg-amber-400 text-[#07162B] font-semibold text-sm"
            >
              Explore Plots
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
