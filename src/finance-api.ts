import {request} from './api';
import type {Card, CreateExpense, EditExpense, EditScope, Expense, FinanceSummary, Income, PendingIncome} from './finance-types';

const json = (method: string, body?: unknown): RequestInit => ({method, ...(body === undefined ? {} : {body: JSON.stringify(body)})});
export const financeApi = {
 summary: (month: string, signal?: AbortSignal) => request<FinanceSummary>(`/finance?month=${encodeURIComponent(month)}`, {signal}),
 cards: (signal?: AbortSignal) => request<Card[]>('/cards', {signal}),
 saveCard: (card: Omit<Card, 'id'>, id?: number) => request<Card>(id === undefined ? '/cards' : `/cards/${id}`, json(id === undefined ? 'POST' : 'PUT', card)),
 createExpense: (expense: CreateExpense) => request<Expense[]>('/expenses', json('POST', expense)),
 editExpense: (id: number, scope: EditScope, expense: EditExpense) => request<Expense[]>(`/expenses/${id}?scope=${scope}`, json('PUT', expense)),
 deleteExpense: (id: number) => request<void>(`/expenses/${id}`, json('DELETE')),
 payExpense: (id: number, date: string) => request<Expense>(`/expenses/${id}/pay`, json('POST', {date})),
 receive: (source: PendingIncome, incomeDate: string) => request<Income>(`/companies/${source.companyId}/incomes`, json('POST', {sourceType: source.sourceType, sourceId: source.sourceId, incomeDate})),
 reverse: (companyId: number, incomeId: number) => request<void>(`/companies/${companyId}/incomes/${incomeId}`, json('DELETE')),
};
