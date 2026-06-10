import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, MessageSquare, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || 'Student';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent hidden sm:block">
              LearnAI
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 md:gap-4">
            <NavLink to="/" end className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/quiz" className={linkClass}>
              <BookOpen className="h-4 w-4" />
              <span>Quiz</span>
            </NavLink>
            <NavLink to="/tutor" className={linkClass}>
              <MessageSquare className="h-4 w-4" />
              <span>AI Tutor</span>
            </NavLink>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
            <div className="hidden lg:flex items-center gap-2 text-slate-300">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2 text-sm font-medium hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
