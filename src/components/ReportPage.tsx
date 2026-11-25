import {useState} from 'react';
import {Download, FileText} from 'lucide-react';
import {workflowApi} from '../workflow-api';
import {useResource} from '../useResource';
import {formatMoney} from '../money';
import {currentMonth, formatDate} from '../dates';
import {LoadState} from './LoadState';
import {downloadReport} from '../report-pdf';

export function ReportPage({companyId}: {companyId: number}) {
  const [month, setMonth] = useState(currentMonth), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const resource = useResource(`report-${companyId}-${month}`, signal => workflowApi.report(companyId, month, signal));
  const report = resource.data;
  return <section className="detail"><div className="section-heading"><h2>Fechamento mensal</h2><label>Mês de referência<input type="month" value={month} onChange={e => setMonth(e.target.value)} required/></label></div><LoadState {...resource}/>{report && <>
    <div className="report-heading"><FileText size={24}/><div><h2>{report.companyName}</h2><p>{month.split('-').reverse().join('/')}</p></div><strong>{formatMoney(report.totalValueCents)}</strong></div>
    <h3 className="compact-heading">Dias trabalhados</h3>{report.workDays.length === 0 && <p className="empty">Nenhum dia marcado.</p>}
    <div className="table-wrap"><table><thead><tr><th>Data</th><th>Manhã</th><th>Tarde</th><th>Valor</th></tr></thead><tbody>{report.workDays.map(day => <tr key={day.id}><td>{formatDate(day.date)}</td><td>{day.workedBeforeLunch ? 'Sim' : 'Não'}</td><td>{day.workedAfterLunch ? 'Sim' : 'Não'}</td><td>{formatMoney((day.workedBeforeLunch ? day.beforeLunchValueCents || 0 : 0) + (day.workedAfterLunch ? day.afterLunchValueCents || 0 : 0))}</td></tr>)}</tbody></table></div>
    {report.additionalServices.length > 0 && <><h3 className="compact-heading">Serviços adicionais</h3>{report.additionalServices.map(s => <div className="record" key={s.id}><span>{formatDate(s.date)}</span><strong>{s.description}</strong><b>{formatMoney(s.amountCents)}</b></div>)}</>}
    {report.approvedEstimates.length > 0 && <><h3 className="compact-heading">Orçamentos aprovados</h3>{report.approvedEstimates.map(s => <div className="record" key={s.id}><span>{formatDate(s.approvedAt || s.date)}</span><strong>{s.description}</strong><b>{formatMoney(s.amountCents)}</b></div>)}</>}
    <div className="report-summary"><p>Dias trabalhados <strong>{report.workedDays}</strong></p><p>Períodos <strong>{report.workedPeriods}</strong></p><p>Trabalho <strong>{formatMoney(report.workDaysValueCents)}</strong></p><p>Serviços <strong>{formatMoney(report.additionalServicesValueCents)}</strong></p><p>Orçamentos <strong>{formatMoney(report.approvedEstimatesValueCents)}</strong></p><p>Total <strong>{formatMoney(report.totalValueCents)}</strong></p></div>
    <div className="report-summary"><p>Recebido deste relatório <strong>{formatMoney(report.receivedValueCents)}</strong></p><p>Pendente deste relatório <strong>{formatMoney(report.pendingValueCents)}</strong></p></div>
    <button className="primary" disabled={busy} onClick={async () => {setBusy(true); setError(''); try {await downloadReport(report);} catch {setError('Não foi possível gerar o PDF. Tente novamente.');} finally {setBusy(false);}}}><Download size={17}/>{busy ? 'Gerando PDF…' : 'Baixar relatório PDF'}</button>{error && <p role="alert" className="error">{error}</p>}
  </>}</section>;
}
