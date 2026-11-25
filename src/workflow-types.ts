export interface WorkDay {
  id: number; companyId: number; date: string;
  workedBeforeLunch: boolean; workedAfterLunch: boolean;
  beforeLunchValueCents: number | null; afterLunchValueCents: number | null;
}
export interface ServiceEntry {
  id: number; companyId: number; date: string; description: string; amountCents: number;
}
export interface Estimate extends ServiceEntry {
  status: 'DRAFT' | 'APPROVED' | 'CANCELED'; approvedAt: string | null;
}
export interface EstimateHistory {
  id: number; previousStatus: string | null; newStatus: string; note: string | null; createdAt: string;
  action?: string; date?: string; description?: string; amountCents?: number;
}
export interface MonthlyReport {
  companyId: number; companyName: string; month: string;
  workDays: WorkDay[]; additionalServices: ServiceEntry[]; approvedEstimates: Estimate[];
  workedDays: number; workedPeriods: number; workDaysValueCents: number;
  additionalServicesValueCents: number; approvedEstimatesValueCents: number; totalValueCents: number;
  receivedValueCents: number; pendingValueCents: number;
}
