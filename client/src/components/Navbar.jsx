import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Attendance', path: '/attendance' },
  ];

  const baseLink =
    'relative text-white transition-all duration-300 ease-in-out px-2 py-1 ' +
    ' after:content-[""] after:absolute after:left-0 after:bottom-0 ' +
    'after:h-[2px] after:bg-white after:transition-all after:duration-300 ' +
    'after:w-0 hover:after:w-full';

  const activeLink =
    'font-medium after:w-full after:opacity-100';

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur bg-primary text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
        <h1 className="text-2xl text-white/80">
             Attendance<span className="text-light font-semibold">Pro</span>
        </h1>
     
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-white ${baseLink} ${isActive ? activeLink : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-all duration-300 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {menuOpen ? (
            <svg
              className="w-6 h-6 transition-transform duration-300"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              fill="none"
            >
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-16 left-0 w-full bg-primary text-white overflow-hidden transition-all duration-500 ease-in-out transform ${
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-start gap-6 px-6 py-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-lg ${baseLink} ${isActive ? activeLink : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
