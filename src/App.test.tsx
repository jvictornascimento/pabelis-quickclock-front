import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,waitFor,fireEvent} from '@testing-library/react';
import App from './App';
import {api} from './api';
vi.mock('./api',()=>({api:{companies:vi.fn(),settings:vi.fn(),createCompany:vi.fn(),saveSettings:vi.fn()}}));
afterEach(()=>{vi.resetAllMocks();localStorage.clear();window.location.hash=''});
const company=(id:number,name:string)=>({id,name,active:true,createdAt:'',updatedAt:''});
const settings=(companyId:number,halfDayValueCents:number)=>({id:companyId,companyId,halfDayValueCents,updatedAt:'',weekdays:{mondayActive:true,tuesdayActive:true,wednesdayActive:true,thursdayActive:true,fridayActive:true,saturdayActive:false,sundayActive:false}});
it('shows a real empty state with no demo company',async()=>{
 vi.mocked(api.companies).mockResolvedValue([]);render(<App/>);
 expect(await screen.findByText('Seu primeiro trabalho começa aqui')).toBeVisible();
 expect(screen.queryByText('Belis Eletrônica')).not.toBeInTheDocument();
});
it('shows server failure and retries',async()=>{
 vi.mocked(api.companies).mockRejectedValueOnce(new Error('Servidor indisponível.')).mockResolvedValueOnce([]);render(<App/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
 fireEvent.click(screen.getByText('Tentar novamente'));
 expect(await screen.findByText('Seu primeiro trabalho começa aqui')).toBeVisible();
});
it('ignores settings from an old company after selection changes',async()=>{
 vi.mocked(api.companies).mockResolvedValue([company(1,'Alpha'),company(2,'Beta')]);
 let resolveOld!:(value:ReturnType<typeof settings>)=>void;
 vi.mocked(api.settings).mockImplementation(id=>id===1?new Promise(resolve=>{resolveOld=resolve}):Promise.resolve(settings(2,22200)));
 render(<App/>);const select=await screen.findByLabelText('EMPRESA SELECIONADA');
 fireEvent.change(select,{target:{value:'1'}});await waitFor(()=>expect(api.settings).toHaveBeenCalledWith(1,expect.any(AbortSignal)));
 fireEvent.change(select,{target:{value:'2'}});expect(await screen.findByText(/222,00/)).toBeVisible();
 resolveOld(settings(1,11100));await waitFor(()=>expect(screen.queryByText(/111,00/)).not.toBeInTheDocument());
});
