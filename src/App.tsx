// src/app/layout.tsx (This will apply to all pages inside the app folder)
import Layout from './layout';

import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Layout>
      {children}
    </Layout>
  );
};

export default AppLayout;
