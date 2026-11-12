import {useState, type FormEvent} from 'react';
import {Check} from 'lucide-react';
import {api} from '../api';
import {parseMoney} from '../money';
import {weekdays,type CompanySettings} from '../types';

const labels=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
export function SettingsForm({settings,onSaved}:{settings:CompanySettings;onSaved:(settings:CompanySettings)=>void}){
  const [value,setValue]=useState((settings.halfDayValueCents/100).toFixed(2).replace('.',','));
  const [days,setDays]=useState(settings.weekdays),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  async function submit(e:FormEvent){e.preventDefault();setError('');setMessage('');setBusy(true);
    try{const saved=await api.saveSettings(settings.companyId,parseMoney(value),days);onSaved(saved);setMessage('Configurações salvas.')}catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  return <form onSubmit={submit} className="settings-form"><h2>Configurações da empresa</h2><label>Valor do meio período (R$)<input value={value} onChange={e=>setValue(e.target.value)} inputMode="decimal" required disabled={busy}/></label><fieldset disabled={busy}><legend>Dias de expediente</legend><div className="weekday-grid">{weekdays.map((day,i)=><label className="weekday" key={day}><input type="checkbox" checked={days[day]} onChange={e=>setDays({...days,[day]:e.target.checked})}/><span>{labels[i]}</span></label>)}</div></fieldset>{error&&<p role="alert" className="error">{error}</p>}{message&&<p role="status" className="success">{message}</p>}<button className="primary" disabled={busy}><Check size={17}/>{busy?'Salvando…':'Salvar configurações'}</button></form>
}
