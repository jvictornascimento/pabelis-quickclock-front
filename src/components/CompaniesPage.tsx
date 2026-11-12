import {useState,type FormEvent} from 'react';
import {Building2,Plus,Check,Archive} from 'lucide-react';
import {api} from '../api';
import type {Company} from '../types';

export function CompaniesPage({companies,onChanged}:{companies:Company[];onChanged:(company:Company)=>void}){
 const [name,setName]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function create(e:FormEvent){e.preventDefault();if(!name.trim())return;setBusy(true);setError('');try{onChanged(await api.createCompany(name.trim()));setName('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <section className="detail"><h2>Minhas empresas</h2>{companies.map(company=><CompanyRow key={company.id} company={company} onChanged={onChanged}/>)}<form onSubmit={create}><h2>Nova empresa</h2><label>Nome da empresa<input value={name} onChange={e=>setName(e.target.value)} required maxLength={120} disabled={busy}/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy||!name.trim()}><Plus size={17}/>{busy?'Salvando…':'Adicionar empresa'}</button></form></section>
}
function CompanyRow({company,onChanged}:{company:Company;onChanged:(company:Company)=>void}){
 const [name,setName]=useState(company.name),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function run(action:()=>Promise<Company>){setBusy(true);setError('');try{onChanged(await action())}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="company-row"><Building2 size={20}/><form onSubmit={e=>{e.preventDefault();void run(()=>api.renameCompany(company.id,name.trim()))}}><label>Nome da empresa<input aria-label={`Nome de ${company.name}`} value={name} onChange={e=>setName(e.target.value)} required maxLength={120} disabled={busy||!company.active}/></label><span>{company.active?'Ativa':'Desativada'}</span><button title="Salvar nome" aria-label={`Salvar nome de ${company.name}`} disabled={busy||!company.active||!name.trim()}><Check size={18}/></button>{company.active&&<button type="button" title="Desativar empresa" aria-label={`Desativar ${company.name}`} disabled={busy} onClick={()=>{if(window.confirm(`Desativar ${company.name}? O histórico será preservado.`))void run(()=>api.deactivateCompany(company.id))}}><Archive size={18}/></button>}</form>{error&&<p role="alert" className="error">{error}</p>}</div>
}
