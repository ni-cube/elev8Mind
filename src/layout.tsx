// src/layout.tsx
import React from 'react';
import "./globals.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
      
        <div className="min-h-screen flex flex-col relative">

          {/* Main Content */}
          <main className="flex-1 p-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-[#72bbce] p-4 text-center text-darkest">
            <p>Elev8 Mind &copy; 2025. All rights reserved.</p>
          </footer>
        </div>  
  );
};
export default Layout;
