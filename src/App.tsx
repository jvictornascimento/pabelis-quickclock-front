import {useEffect,useState} from 'react';
import {Clock3,Building2,CalendarDays,ChartNoAxesCombined,Settings,ChevronRight,Menu,X,FileText,Wallet,ClipboardList} from 'lucide-react';
import {api} from './api';
import type {Company,CompanySettings} from './types';
import {formatMoney} from './money';
import {CompaniesPage} from './components/CompaniesPage';
import {SettingsForm} from './components/SettingsForm';
import {DailyWorkPage,WorkDaysPage} from './components/WorkDayPage';
import {EntriesPage} from './components/EntriesPage';
import {ReportPage} from './components/ReportPage';
import {FinancePage} from './components/FinancePage';
import './workflows.css';

const pages=[['home','Trabalho de hoje',Clock3],['companies','Empresas',Building2],['days','Dias trabalhados',CalendarDays],['services','Serviços adicionais',Wallet],['estimates','Orçamentos',ClipboardList],['reports','Relatórios',FileText],['finance','Financeiro',ChartNoAxesCombined],['settings','Configurações',Settings]] as const;
type Page=typeof pages[number][0];
function initialPage():Page{const value=window.location.hash.slice(1);return pages.some(([id])=>id===value)?value as Page:'home'}
function lastCompany():number|null{try{const saved=localStorage.getItem('quickclock-company');return saved?Number(saved):null}catch{return null}}

export default function App(){
 const [page,setPage]=useState<Page>(initialPage),[menu,setMenu]=useState(false),[companies,setCompanies]=useState<Company[]>([]),[selected,setSelected]=useState<number|null>(lastCompany),[loading,setLoading]=useState(true),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const [settings,setSettings]=useState<CompanySettings|null>(null),[settingsError,setSettingsError]=useState(''),[settingsLoading,setSettingsLoading]=useState(false),[settingsAttempt,setSettingsAttempt]=useState(0);
 const company=companies.find(c=>c.id===selected),title=pages.find(([id])=>id===page)![1];
 useEffect(()=>{const change=()=>setPage(initialPage());window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');api.companies(controller.signal).then(list=>{if(controller.signal.aborted)return;setCompanies(list);setSelected(current=>list.some(c=>c.id===current)?current:null)}).catch(e=>{if(!controller.signal.aborted)setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[attempt]);
 useEffect(()=>{try{if(selected!==null)localStorage.setItem('quickclock-company',String(selected));else localStorage.removeItem('quickclock-company')}catch{/* Selection works even if storage is unavailable. */}},[selected]);
 useEffect(()=>{setSettings(null);setSettingsError('');if(!company){setSettingsLoading(false);return}const controller=new AbortController();setSettingsLoading(true);api.settings(company.id,controller.signal).then(value=>{if(!controller.signal.aborted)setSettings(value)}).catch(e=>{if(!controller.signal.aborted)setSettingsError(e.message)}).finally(()=>{if(!controller.signal.aborted)setSettingsLoading(false)});return()=>controller.abort()},[company?.id,settingsAttempt]);
 function navigate(id:Page){window.location.hash=id;setPage(id);setMenu(false)}
 function updateCompany(value:Company){setCompanies(current=>current.some(c=>c.id===value.id)?current.map(c=>c.id===value.id?value:c):[...current,value]);if(value.active)setSelected(value.id);else if(selected===value.id)setSelected(null)}
 function content(){
   if(page==='finance')return <FinancePage/>;
   if(page==='companies')return <CompaniesPage companies={companies} onChanged={updateCompany}/>;
   if(!company)return <section className="notice"><Building2 size={28}/><h2>{companies.some(c=>c.active)?'Selecione uma empresa':'Seu primeiro trabalho começa aqui'}</h2><p>Escolha ou cadastre a empresa para continuar.</p><button className="primary" onClick={()=>navigate('companies')}>Gerenciar empresas</button></section>;
   if(page==='home'||page==='settings'){
     if(!company.active)return <div className="notice">Empresa desativada. O histórico continua disponível em consultas e relatórios.</div>;
     if(settingsLoading||settings?.companyId!==company.id&&!settingsError)return <p role="status" className="empty">Carregando configurações…</p>;
     if(settingsError)return <div role="alert"><p className="error">{settingsError}</p><button className="primary" onClick={()=>setSettingsAttempt(v=>v+1)}>Tentar novamente</button></div>;
     if(!settings)return null;
     if(page==='home')return <DailyWorkPage key={company.id} companyId={company.id} settings={settings}/>;
     return <SettingsForm key={company.id} settings={settings} onSaved={value=>setSettings(current=>current?.companyId===value.companyId?value:current)}/>;
   }
   if(page==='days')return <WorkDaysPage key={company.id} companyId={company.id}/>;
   if(page==='reports')return <ReportPage key={company.id} companyId={company.id}/>;
   return <EntriesPage key={`${page}-${company.id}`} companyId={company.id} estimates={page==='estimates'}/>;
 }
 return <div className="app"><aside className={menu?'open':''}><a className="brand" href="#home" onClick={()=>setMenu(false)}><span className="logo"/><span>QuickClock<span className="brand-dot">.</span></span></a><p className="nav-label">ESPAÇO DE TRABALHO</p><nav aria-label="Navegação principal">{pages.map(([id,label,Icon])=><button key={id} className={page===id?'selected':''} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={19}/>{label}{page===id&&<span className="nav-dot"/>}</button>)}</nav><div className="side-bottom"><span className="avatar"><Clock3 size={17}/></span><div><strong>Meu espaço</strong><small>Uso pessoal</small></div></div></aside>{menu&&<div className="shade" onClick={()=>setMenu(false)}/>}
 <div className="workspace"><header><div className="breadcrumb"><button className="mobile-menu" aria-label={menu?'Fechar menu':'Abrir menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button><span>Meu espaço</span><ChevronRight size={14}/><strong>{title}</strong></div><div className="header-right"><span className="local-dot"/>Servidor local</div></header><main><div className="title-row"><div><p className="eyebrow">SEU TRABALHO, EM DIA</p><h1>{page==='home'?'Um dia de cada vez.':title}</h1><p className="subtitle">{page==='home'?'Registre seus períodos e acompanhe o seu trabalho.':'Organize seus trabalhos, uma empresa de cada vez.'}</p></div><span className="date-chip"><CalendarDays size={16}/>{new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'long'}).format(new Date())}</span></div>
 {loading?<div className="empty" role="status">Carregando empresas…</div>:error?<div className="notice error" role="alert"><p>{error}</p><button className="primary" onClick={()=>setAttempt(v=>v+1)}>Tentar novamente</button></div>:<>
 {page!=='finance'&&<div className="company-strip"><div className="company-icon"><Building2 size={22}/></div><div><label htmlFor="company">EMPRESA SELECIONADA</label><select id="company" value={selected??''} onChange={e=>setSelected(e.target.value?Number(e.target.value):null)}><option value="">Selecione uma empresa</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}{!c.active?' (desativada)':''}</option>)}</select></div>{settings?.companyId===selected&&<div className="daily-rate"><small>Valor do período</small><strong>{formatMoney(settings.halfDayValueCents)}</strong></div>}</div>}
 {content()}
 </>}
 <footer><span><Clock3 size={14}/>QuickClock</span><span>Seu trabalho, organizado.</span></footer></main></div></div>
}
