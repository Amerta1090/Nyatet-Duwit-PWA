import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface DeepLinkHandlers {
  onAddTransaction: () => void;
  onAddWithCategory?: (categoryId: string) => void;
  onNavigate?: (path: string) => void;
}

const CATEGORY_MAP: Record<string, string> = {
  food: 'cat-food',
  transport: 'cat-transport',
  shopping: 'cat-shopping',
  entertainment: 'cat-entertainment',
  bills: 'cat-bills',
};

export function useDeepLink({ onAddTransaction, onAddWithCategory, onNavigate }: DeepLinkHandlers) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const action = searchParams.get('action');

    if (action === 'add') {
      const category = searchParams.get('category');
      if (category && CATEGORY_MAP[category] && onAddWithCategory) {
        onAddWithCategory(CATEGORY_MAP[category]);
      } else {
        onAddTransaction();
      }
      setSearchParams({}, { replace: true });
      return;
    }

    if (action === 'dashboard') {
      navigate('/', { replace: true });
      return;
    }

    if (action === 'insights') {
      navigate('/insights', { replace: true });
      return;
    }
  }, [searchParams, onAddTransaction, onAddWithCategory, onNavigate, navigate, setSearchParams]);
}
