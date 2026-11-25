import {useState, type FormEvent} from 'react';
import {Plus, Pencil, Trash2, Check, History, X} from 'lucide-react';
import {workflowApi} from '../workflow-api';
import {useResource} from '../useResource';
import {formatMoney, parseMoney} from '../money';
import {todayInSaoPaulo, currentMonth, formatDate} from '../dates';
import {LoadState} from './LoadState';
import type {ServiceEntry, Estimate, EstimateHistory} from '../workflow-types';

export function EntriesPage({companyId, estimates = false}: {companyId: number; estimates?: boolean}) {
  const [month, setMonth] = useState(currentMonth), [edit, setEdit] = useState<ServiceEntry | null>(null);
  const [date, setDate] = useState(todayInSaoPaulo), [description, setDescription] = useState(''), [value, setValue] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [history, setHistory] = useState<EstimateHistory[] | null>(null), [historyTitle, setHistoryTitle] = useState('');
  const resource = useResource(`entries-${companyId}-${estimates}-${month}`, signal => estimates ? workflowApi.estimates(companyId, signal) : workflowApi.services(companyId, month, signal));
  function reset() {setEdit(null); setDescription(''); setValue(''); setDate(todayInSaoPaulo());}
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const input = {date, description: description.trim(), amountCents: parseMoney(value)};
      if (estimates) await workflowApi.saveEstimate(companyId, input, edit?.id);
      else await workflowApi.saveService(companyId, input, edit?.id);
      setMonth(date.slice(0, 7)); reset(); resource.retry(); setMessage('Lançamento salvo.');
    } catch (e) {setError((e as Error).message);} finally {setBusy(false);}
  }
  async function action(run: () => Promise<unknown>, success: string) {
    setBusy(true); setError(''); setMessage('');
    try {await run(); resource.retry(); setMessage(success);} catch (e) {setError((e as Error).message);} finally {setBusy(false);}
  }
  return <section className="detail"><div className="section-heading"><h2>{estimates ? 'Meus orçamentos' : 'Serviços do mês'}</h2>{!estimates && <label>Mês<input type="month" value={month} onChange={e => setMonth(e.target.value)} required/></label>}</div>
    <LoadState {...resource}/>{resource.data?.length === 0 && <p className="empty">Nenhum lançamento encontrado.</p>}
    {resource.data?.map(entry => {const estimate = entry as Estimate; const locked = estimates && estimate.status !== 'DRAFT'; return <article className="entry-row" key={entry.id}><div><strong>{entry.description}</strong><small>{formatDate(entry.date)}{estimates && ` · ${estimate.status === 'APPROVED' ? 'Aprovado' : estimate.status === 'CANCELED' ? 'Cancelado' : 'Rascunho'}`}</small></div><b>{formatMoney(entry.amountCents)}</b><div className="row-actions">
      {!locked && <button disabled={busy} title="Editar" aria-label={`Editar ${entry.description}`} onClick={() => {setEdit(entry); setDate(entry.date); setDescription(entry.description); setValue((entry.amountCents / 100).toFixed(2).replace('.', ','));}}><Pencil size={17}/></button>}
      {!locked && <button disabled={busy} title="Excluir" aria-label={`Excluir ${entry.description}`} onClick={() => {if (window.confirm('Excluir este lançamento?')) void action(async () => {if(estimates)await workflowApi.deleteEstimate(companyId,entry.id);else await workflowApi.deleteService(companyId,entry.id);if(edit?.id===entry.id)reset();}, 'Lançamento excluído.');}}><Trash2 size={17}/></button>}
      {estimates && !locked && <button disabled={busy} title="Aprovar orçamento" aria-label={`Aprovar ${entry.description}`} onClick={() => {if (window.confirm('Aprovar este orçamento e incluir no recebimento deste mês?')) void action(async () => {await workflowApi.approveEstimate(companyId,entry.id);if(edit?.id===entry.id)reset();}, 'Orçamento aprovado.');}}><Check size={17}/></button>}
      {estimates && <button disabled={busy} title="Ver histórico" aria-label={`Histórico de ${entry.description}`} onClick={() => {setHistory(null); setHistoryTitle(''); void action(async () => {const rows = await workflowApi.estimateHistory(companyId, entry.id); setHistory(rows); setHistoryTitle(entry.description);}, '');}}><History size={17}/></button>}
    </div></article>;})}
    {history && <section className="history"><div className="section-heading"><h2>Histórico: {historyTitle}</h2><button className="icon-button" aria-label="Fechar histórico" onClick={() => setHistory(null)}><X size={18}/></button></div>{history.length === 0 ? <p>Sem alterações.</p> : history.map(row => <div className="record" key={row.id}><span>{formatDate(row.createdAt)}</span><strong>{({DRAFT:'Rascunho',APPROVED:'Aprovado',CANCELED:'Cancelado'} as Record<string,string>)[row.newStatus] || row.newStatus}</strong><span>{row.description || row.note}</span>{row.amountCents !== undefined && <b>{formatMoney(row.amountCents)}</b>}</div>)}</section>}
    <form onSubmit={submit}><h2>{edit ? 'Editar lançamento' : estimates ? 'Novo orçamento' : 'Novo serviço'}</h2><label>Descrição<input value={description} onChange={e => setDescription(e.target.value)} maxLength={255} required disabled={busy}/></label><label>Data<input type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={busy}/></label><label>Valor (R$)<input inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} required disabled={busy}/></label><div className="form-actions"><button className="primary" disabled={busy || !description.trim()}><Plus size={17}/>{busy ? 'Salvando…' : 'Salvar lançamento'}</button>{edit && <button type="button" className="secondary" disabled={busy} onClick={reset}>Cancelar edição</button>}</div></form>
    {error && <p role="alert" className="error">{error}</p>}{message && <p role="status" className="success">{message}</p>}
  </section>;
}
