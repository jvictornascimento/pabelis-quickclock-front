import {render, screen, fireEvent} from '@testing-library/react';
import {it, expect, vi, afterEach} from 'vitest';
import {ReportPage} from './ReportPage';
import {workflowApi} from '../workflow-api';
import {downloadReport} from '../report-pdf';
vi.mock('../workflow-api', () => ({workflowApi: {report: vi.fn()}}));
vi.mock('../report-pdf', () => ({downloadReport: vi.fn().mockResolvedValue(undefined)}));
afterEach(() => vi.resetAllMocks());
it('downloads the same report object that the screen shows', async () => {
  const report = {companyId: 7, companyName: 'Empresa QA', month: '2026-10', workDays: [], additionalServices: [], approvedEstimates: [], workedDays: 21, workedPeriods: 41, workDaysValueCents: 410000, additionalServicesValueCents: 0, approvedEstimatesValueCents: 0, totalValueCents: 410000, receivedValueCents: 10000, pendingValueCents: 400000};
  vi.mocked(workflowApi.report).mockResolvedValue(report);
  render(<ReportPage companyId={7}/>);
  fireEvent.click(await screen.findByRole('button', {name: 'Baixar relatório PDF'}));
  expect(downloadReport).toHaveBeenCalledWith(report);
  expect(screen.getAllByText(/4\.100,00/).length).toBeGreaterThan(0);
  expect(screen.getByText('Recebido deste relatório')).toBeInTheDocument();
  expect(screen.getByText(/4\.000,00/)).toBeInTheDocument();
});
