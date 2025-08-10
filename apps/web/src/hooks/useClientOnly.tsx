import { useEffect, useState } from 'react';

export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useClientOnly();
  return isClient ? <>{children}</> : null;
}
