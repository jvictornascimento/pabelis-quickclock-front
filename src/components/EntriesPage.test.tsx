import {render, screen, fireEvent} from '@testing-library/react';
import {it, expect, vi, afterEach} from 'vitest';
import {EntriesPage} from './EntriesPage';
import {workflowApi} from '../workflow-api';
vi.mock('../workflow-api', () => ({workflowApi: {services: vi.fn(), saveService: vi.fn(), deleteService: vi.fn(), estimates: vi.fn(), approveEstimate: vi.fn(), estimateHistory: vi.fn()}}));
afterEach(() => vi.resetAllMocks());
it('keeps a failed service form for retry without showing saved', async () => {
  vi.mocked(workflowApi.services).mockResolvedValue([]);
  vi.mocked(workflowApi.saveService).mockRejectedValue(new Error('Servidor indisponível'));
  render(<EntriesPage companyId={7}/>);
  await screen.findByText('Nenhum lançamento encontrado.');
  fireEvent.change(screen.getByLabelText('Descrição'), {target: {value: 'Reparo de placa'}});
  fireEvent.change(screen.getByLabelText('Valor (R$)'), {target: {value: '100,10'}});
  fireEvent.click(screen.getByRole('button', {name: 'Salvar lançamento'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
  expect(screen.getByLabelText('Descrição')).toHaveValue('Reparo de placa');
  expect(screen.queryByText('Lançamento salvo.')).not.toBeInTheDocument();
  expect(workflowApi.saveService).toHaveBeenCalledWith(7, expect.objectContaining({description: 'Reparo de placa', amountCents: 10010}), undefined);
});
it('requires confirmation before approving an estimate', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  vi.mocked(workflowApi.estimates).mockResolvedValue([{id: 9, companyId: 7, date: '2026-11-25', description: 'Instalação', amountCents: 20000, status: 'DRAFT', approvedAt: null}]);
  render(<EntriesPage companyId={7} estimates/>);
  fireEvent.click(await screen.findByRole('button', {name: 'Aprovar Instalação'}));
  expect(workflowApi.approveEstimate).not.toHaveBeenCalled();
});
it('closes the edit form when the edited service is deleted', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.mocked(workflowApi.services).mockResolvedValueOnce([{id:7,companyId:1,date:'2026-11-25',description:'Reparo',amountCents:10000}]).mockResolvedValue([]);
  vi.mocked(workflowApi.deleteService).mockResolvedValue(undefined);
  render(<EntriesPage companyId={1}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Editar Reparo'}));
  fireEvent.click(screen.getByRole('button',{name:'Excluir Reparo'}));
  expect(await screen.findByRole('heading',{name:'Novo serviço'})).toBeVisible();
  expect(screen.queryByRole('heading',{name:'Editar lançamento'})).not.toBeInTheDocument();
});
