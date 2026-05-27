import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface DeepLinkHandlers {
  onAddTransaction: () => void;
}

export function useDeepLink({ onAddTransaction }: DeepLinkHandlers) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      onAddTransaction();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, onAddTransaction, setSearchParams]);
}
