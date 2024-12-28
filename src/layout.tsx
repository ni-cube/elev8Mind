// src/layout.tsx
import React from 'react';
import "./globals.css";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#e8f4f7]">

      {/* Main Content */}
      <main className="flex-1 p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#72bbce] p-4 text-center text-white">
        <p>VibeSpace &copy; 2026. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
