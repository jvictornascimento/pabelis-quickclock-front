export type IncomeSourceType = 'WORK_REPORT' | 'ADDITIONAL_SERVICE' | 'APPROVED_ESTIMATE';
export type PaymentMethod = 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT_CARD' | 'OTHER';
export interface Card {id: number; name: string; closingDay: number; dueDay: number}
export interface PendingIncome {companyId: number; companyName: string; sourceType: IncomeSourceType; sourceId: number; date: string; description: string; amountCents: number}
export interface Income extends Omit<PendingIncome, 'date'> {id: number; incomeDate: string}
export interface Expense {id: number; date: string; description: string; amountCents: number; category: string | null; paymentMethod: PaymentMethod; cardId: number | null; installmentGroupId: string; installmentNumber: number; installmentTotal: number; paid: boolean; paidAt: string | null}
export interface FinanceSummary {month: string; incomeCents: number; expenseCents: number; expectedIncomeCents: number; expectedExpenseCents: number; balanceCents: number; projectedBalanceCents: number; incomes: Income[]; expenses: Expense[]; pendingIncome: PendingIncome[]; paidExpenses: Expense[]}
export interface CreateExpense {description: string; date: string; amountCents: number; category: string | null; paymentMethod: PaymentMethod; cardId: number | null; installmentTotal: number}
export type EditExpense = Pick<CreateExpense, 'description' | 'amountCents' | 'category'>;
export type EditScope = 'ONE' | 'UNPAID';
