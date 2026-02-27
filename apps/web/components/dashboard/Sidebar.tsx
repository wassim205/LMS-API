"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileQuestion,
  BarChart3,
  User,
  LogOut,
  GraduationCap,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const generalLinks: NavItem[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/teacher" },
  { icon: BookOpen, label: "Courses", href: "/teacher/courses" },
  { icon: Users, label: "Students", href: "/teacher/students" },
  { icon: FileQuestion, label: "Quizzes", href: "/teacher/quizzes" },
  { icon: BarChart3, label: "Analytics", href: "/teacher/analytics" },
];

const settingsLinks: NavItem[] = [
  { icon: User, label: "Profile", href: "/teacher/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Instructor";
  const displayEmail = user?.email || "instructor@ed-academy.com";

  return (
    <aside className="w-64 bg-black h-full flex flex-col flex-shrink-0 text-white z-20">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-red-700 p-2 rounded-sm">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Bright Academy</h1>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              Instructor Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-5 px-4 flex flex-col gap-1">
        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          General
        </p>

        {generalLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-white" : "text-zinc-500"}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <div className="my-4 border-t border-zinc-800"></div>
        <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Settings
        </p>

        {settingsLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                isActive
                  ? "bg-red-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon size={18} className="text-zinc-500" />
              <span>{link.label}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all mt-1"
        >
          <LogOut size={18} className="text-zinc-500" />
          <span>Logout</span>
        </button>
      </nav>

      {/* User Profile (Bottom) */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 p-2 rounded-sm cursor-pointer hover:bg-zinc-900 transition-colors">
          <div className="bg-zinc-700 rounded-full h-10 w-10 overflow-hidden flex items-center justify-center ring-2 ring-red-700 text-white font-bold uppercase">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-zinc-500 truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
