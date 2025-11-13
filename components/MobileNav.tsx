'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface MobileNavProps {
  userPhotoUrl?: string | null;
  userName?: string;
}

export default function MobileNav({ userPhotoUrl, userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navSections = [
    {
      title: 'CAPTURE',
      links: [
        { href: '/dashboard', label: 'Home', icon: HomeIcon },
        { href: '/timeline', label: 'Timeline', icon: CalendarDaysIcon },
      ],
    },
    {
      title: 'ORGANIZE',
      links: [
        { href: '/sizes', label: 'Sizes & Needs', icon: TagIcon },
        { href: '/care-info', label: 'Care Information', icon: ClipboardDocumentListIcon },
        { href: '/reminders', label: 'Reminders', icon: DocumentTextIcon },
      ],
    },
    {
      title: 'SHARE & SUPPORT',
      links: [
        { href: '/advice', label: 'Chat with Liv', icon: LightBulbIcon },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-sand shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-serif text-gray-900">OneLittleThing</span>
          </Link>

          {/* Spacer to keep logo centered */}
          <div className="w-10"></div>
        </div>

      </header>

      {/* Mobile Slide-out Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-[57px] left-0 bottom-0 w-64 bg-white shadow-2xl z-50 overflow-y-auto">
            {/* User Info */}
            <div className="p-4 border-b border-sand bg-cream/30">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {userPhotoUrl ? (
                  <img
                    src={userPhotoUrl}
                    alt={userName || 'User'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-sand"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-sand flex items-center justify-center">
                    <UserCircleIcon className="w-7 h-7 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {userName || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">View profile</div>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="p-2">
              {navSections.map((section, sectionIndex) => (
                <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                  {/* Section Header */}
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 tracking-wider">
                    {section.title}
                  </div>

                  {/* Section Links */}
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? 'bg-sage/10 text-sage'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Account Section */}
            <div className="p-2 border-t border-sand mt-6">
              {/* Account Header */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 tracking-wider">
                ACCOUNT
              </div>

              {/* Profile & Family Settings */}
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-sage/10 text-sage'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCircleIcon className="w-5 h-5" />
                Profile & Family Settings
              </Link>

              {/* Sign Out */}
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
