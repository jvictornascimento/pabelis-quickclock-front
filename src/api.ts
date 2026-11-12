import type {Company, CompanySettings, Weekdays} from './types';

export class ApiError extends Error {
  constructor(message:string, public status:number){super(message)}
}

export async function request<T>(path:string, options:RequestInit = {}):Promise<T>{
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 12000);
  const abort = ()=>controller.abort();
  options.signal?.addEventListener('abort', abort, {once:true});
  if(options.signal?.aborted) controller.abort();
  try {
    const response = await fetch('/api'+path, {...options, signal:controller.signal,
      headers:{...options.headers, ...(options.body?{'Content-Type':'application/json'}:{})}});
    if(!response.ok){
      const message = response.status===404?'Registro não encontrado.':response.status>=500?'Servidor indisponível. Tente novamente.':'Não foi possível salvar. Confira os dados.';
      throw new ApiError(message,response.status);
    }
    if(response.status===204)return undefined as T;
    if(!response.headers.get('content-type')?.includes('application/json'))throw new ApiError('Resposta inválida do servidor.',502);
    return await response.json() as T;
  }catch(error){
    if(error instanceof ApiError)throw error;
    if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
    throw new ApiError('Servidor indisponível. Tente novamente.',0);
  }finally{clearTimeout(timeout);options.signal?.removeEventListener('abort',abort)}
}

export const api={
  companies:(signal?:AbortSignal)=>request<Company[]>('/companies',{signal}),
  createCompany:(name:string)=>request<Company>('/companies',{method:'POST',body:JSON.stringify({name})}),
  renameCompany:(id:number,name:string)=>request<Company>(`/companies/${id}`,{method:'PUT',body:JSON.stringify({name})}),
  deactivateCompany:(id:number)=>request<Company>(`/companies/${id}`,{method:'DELETE'}),
  settings:(id:number,signal?:AbortSignal)=>request<CompanySettings>(`/companies/${id}/settings`,{signal}),
  saveSettings:(id:number,halfDayValueCents:number,weekdays:Weekdays)=>request<CompanySettings>(`/companies/${id}/settings`,{method:'PUT',body:JSON.stringify({halfDayValueCents,weekdays})}),
};
