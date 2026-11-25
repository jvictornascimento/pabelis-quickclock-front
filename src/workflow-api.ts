import {request} from './api';
import type {WorkDay, ServiceEntry, Estimate, EstimateHistory, MonthlyReport} from './workflow-types';
export type EntryInput = Pick<ServiceEntry, 'date' | 'description' | 'amountCents'>;
const prefix = (companyId: number) => `/companies/${companyId}`;
export const workflowApi = {
  days: (companyId: number, filters: {date?: string; month?: string}, signal?: AbortSignal) =>
    request<WorkDay[]>(`${prefix(companyId)}/work-days?${new URLSearchParams(filters)}`, {signal}),
  saveDay: (companyId: number, date: string, workedBeforeLunch: boolean, workedAfterLunch: boolean) =>
    request<WorkDay>(`${prefix(companyId)}/work-days/${date}`, {method: 'PUT', body: JSON.stringify({workedBeforeLunch, workedAfterLunch})}),
  services: (companyId: number, month: string, signal?: AbortSignal) => request<ServiceEntry[]>(`${prefix(companyId)}/additional-services?month=${month}`, {signal}),
  saveService: (companyId: number, input: EntryInput, id?: number) => request<ServiceEntry>(`${prefix(companyId)}/additional-services${id ? `/${id}` : ''}`, {method: id ? 'PUT' : 'POST', body: JSON.stringify(input)}),
  deleteService: (companyId: number, id: number) => request<void>(`${prefix(companyId)}/additional-services/${id}`, {method: 'DELETE'}),
  estimates: (companyId: number, signal?: AbortSignal) => request<Estimate[]>(`${prefix(companyId)}/estimates`, {signal}),
  saveEstimate: (companyId: number, input: EntryInput, id?: number) => request<Estimate>(`${prefix(companyId)}/estimates${id ? `/${id}` : ''}`, {method: id ? 'PUT' : 'POST', body: JSON.stringify(input)}),
  approveEstimate: (companyId: number, id: number) => request<Estimate>(`${prefix(companyId)}/estimates/${id}/approve`, {method: 'POST'}),
  deleteEstimate: (companyId: number, id: number) => request<void>(`${prefix(companyId)}/estimates/${id}`, {method: 'DELETE'}),
  estimateHistory: (companyId: number, id: number) => request<EstimateHistory[]>(`${prefix(companyId)}/estimates/${id}/history`),
  report: (companyId: number, month: string, signal?: AbortSignal) => request<MonthlyReport>(`${prefix(companyId)}/reports?month=${month}`, {signal}),
};
