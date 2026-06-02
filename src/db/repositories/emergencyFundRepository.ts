import { db } from '../schema';
import { transactionRepo } from './transactionRepository';
import { accountRepo } from './accountRepository';

const SETTING_TARGET = 'emergency_fund_target';
const SETTING_ACCOUNTS = 'emergency_fund_accounts';

export const emergencyFundRepo = {
  async getTarget(): Promise<{ mode: 'auto' | 'manual'; amount: number }> {
    const setting = await db.settings.get(SETTING_TARGET);
    if (!setting || setting.value === 'auto') {
      const avg = await this.calculateRecommendedAmount();
      return { mode: 'auto', amount: avg };
    }
    return { mode: 'manual', amount: Number(setting.value) };
  },

  async setTarget(amount: number | 'auto'): Promise<void> {
    const value = amount === 'auto' ? 'auto' : String(amount);
    await db.settings.put({ key: SETTING_TARGET, value });
  },

  async getLinkedAccountIds(): Promise<string[]> {
    const setting = await db.settings.get(SETTING_ACCOUNTS);
    if (!setting || !setting.value) return [];
    return setting.value.split(',').filter(Boolean);
  },

  async setLinkedAccountIds(ids: string[]): Promise<void> {
    await db.settings.put({ key: SETTING_ACCOUNTS, value: ids.join(',') });
  },

  async getCurrentAmount(): Promise<number> {
    const ids = await this.getLinkedAccountIds();
    if (ids.length === 0) {
      const accounts = await accountRepo.getAll(true);
      return accounts.reduce((sum, a) => sum + a.balance, 0);
    }
    let total = 0;
    for (const id of ids) {
      const account = await accountRepo.getById(id);
      if (account) total += account.balance;
    }
    return total;
  },

  async calculateRecommendedAmount(): Promise<number> {
    const now = Date.now();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const from = threeMonthsAgo.getTime();
    const to = now;
    const totalExpense = await transactionRepo.getTotalByType('expense', from, to);
    const monthlyAvg = totalExpense / 3;
    return Math.round(monthlyAvg * 3);
  },

  async getProgress(): Promise<{ current: number; target: number; percent: number }> {
    const [current, targetSetting] = await Promise.all([
      this.getCurrentAmount(),
      this.getTarget(),
    ]);
    const target = targetSetting.amount;
    return {
      current,
      target,
      percent: target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0,
    };
  },
};
