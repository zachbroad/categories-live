import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { setupGlobalErrorHandler } from '../utils/errorHandler';

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  return <Outlet />;
}
