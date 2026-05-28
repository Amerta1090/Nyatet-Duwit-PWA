import { useEffect, useCallback } from 'react';
import { transactionRepo } from '@/db/repositories/transactionRepository';
import { categoryRepo } from '@/db/repositories/categoryRepository';
import { getWeekRange } from '@/utils/date';

export function useWeeklySummary() {
  const generateAndSend = useCallback(async () => {
    try {
      const { start, end } = getWeekRange(Date.now());
      const summary = await transactionRepo.getWeeklySummary(start, end);
      const cats = await categoryRepo.getAll();

      const totalExpense = summary.totalExpense;
      const totalIncome = summary.totalIncome;

      let topCategory = '';
      if (summary.topCategories.length > 0) {
        const cat = cats.find((c) => c.id === summary.topCategories[0]!.categoryId);
        topCategory = cat?.name ?? '';
      }

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_WEEKLY_SUMMARY_NOW',
          payload: { totalExpense, totalIncome, topCategory },
        });
      }
    } catch {
      // Silently fail - the SW will show a generic fallback
    }
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'GENERATE_WEEKLY_SUMMARY') {
        generateAndSend();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [generateAndSend]);

  const scheduleWeeklySummary = useCallback(async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_WEEKLY_SUMMARY',
      });
    }
  }, []);

  const clearWeeklySummary = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_WEEKLY_SUMMARY',
      });
    }
  }, []);

  return { generateAndSend, scheduleWeeklySummary, clearWeeklySummary };
}
