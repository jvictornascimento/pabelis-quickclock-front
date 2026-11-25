import {useEffect, useState} from 'react';
import {Check, Sun, Sunset, CalendarDays} from 'lucide-react';
import type {CompanySettings} from '../types';
import {weekdays} from '../types';
import {workflowApi} from '../workflow-api';
import {todayInSaoPaulo, currentMonth, formatDate} from '../dates';
import {formatMoney} from '../money';
import {useResource} from '../useResource';
import {LoadState} from './LoadState';
import type {WorkDay} from '../workflow-types';

export function DailyWorkPage({companyId, settings}: {companyId: number; settings: CompanySettings}) {
  const [date, setDate] = useState(todayInSaoPaulo);
  useEffect(() => {const timer = setInterval(() => setDate(todayInSaoPaulo()), 1000); return () => clearInterval(timer);}, []);
  return <DailyWork key={`${companyId}-${date}`} companyId={companyId} date={date} settings={settings}/>;
}
function DailyWork({companyId, date, settings}: {companyId: number; date: string; settings: CompanySettings}) {
  const resource = useResource(`day-${companyId}-${date}`, signal => workflowApi.days(companyId, {date}, signal));
  const [saved, setSaved] = useState<WorkDay | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const record = saved || resource.data?.[0];
  const values = [record?.workedBeforeLunch || false, record?.workedAfterLunch || false];
  const index = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  const enabled = settings.weekdays[weekdays[index]];
  async function toggle(period: number) {
    if (busy) return;
    if (todayInSaoPaulo() !== date) {setError('O dia mudou. Recarregue os registros.'); return;}
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await workflowApi.saveDay(companyId, date, period === 0 ? !values[0] : values[0], period === 1 ? !values[1] : values[1]);
      setSaved(result); setMessage('Registro salvo.');
    } catch (e) {
      setError((e as Error).message);
      setSaved(null);
      resource.retry();
    } finally {setBusy(false);}
  }
  return <section className="work-section"><div className="section-heading"><div><h2>Seu registro de hoje</h2><p>{formatDate(date)}</p></div><span className="badge"><span/>{busy ? 'Salvando…' : 'Hoje'}</span></div>
    <LoadState {...resource}/>
    {!resource.loading && !resource.error && (!enabled ? <div className="notice"><Sun size={28}/><h2>Hoje não há expediente. Aproveite sua folga!</h2></div> : <>
      <div className="periods">{[Sun, Sunset].map((Icon, i) => <button key={i} className={`period ${values[i] ? 'marked' : ''}`} aria-pressed={values[i]} disabled={busy} onClick={() => toggle(i)}><div className="period-top"><span className="period-icon"><Icon size={26}/></span><span className="checkbox">{values[i] && <Check size={16}/>}</span></div><small>{i === 0 ? 'PRIMEIRO PERÍODO' : 'SEGUNDO PERÍODO'}</small><h3>{i === 0 ? 'Antes do almoço' : 'Depois do almoço'}</h3><div className="period-bottom"><span>{values[i] ? 'Trabalho registrado' : 'Ainda não registrado'}</span><strong>{formatMoney((i === 0 ? record?.beforeLunchValueCents : record?.afterLunchValueCents) ?? settings.halfDayValueCents)}</strong></div></button>)}</div>
      {message && <p role="status" className="success">{message}</p>}{error && <p role="alert" className="error">{error}</p>}
    </>)}
  </section>;
}
export function WorkDaysPage({companyId}: {companyId: number}) {
  const [month, setMonth] = useState(currentMonth), [date, setDate] = useState('');
  const resource = useResource(`days-${companyId}-${month}-${date}`, signal => workflowApi.days(companyId, date ? {date} : {month}, signal));
  return <section className="detail"><div className="filters"><label>Mês<input type="month" value={month} onChange={e => {setMonth(e.target.value); setDate('');}} required/></label><label>Data específica<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label></div><LoadState {...resource}/>{resource.data?.length === 0 && <p className="empty">Nenhum dia registrado neste período.</p>}{resource.data?.map(day => <div className="record" key={day.id}><CalendarDays size={18}/><strong>{formatDate(day.date)}</strong><span>Manhã: {day.workedBeforeLunch ? 'Sim' : 'Não'} · Tarde: {day.workedAfterLunch ? 'Sim' : 'Não'}</span><b>{formatMoney((day.workedBeforeLunch ? day.beforeLunchValueCents || 0 : 0) + (day.workedAfterLunch ? day.afterLunchValueCents || 0 : 0))}</b></div>)}</section>;
}
