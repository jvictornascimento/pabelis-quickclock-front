import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {it,expect,vi,afterEach} from 'vitest';
import {DailyWorkPage} from './WorkDayPage';
import {workflowApi} from '../workflow-api';
vi.mock('../workflow-api',()=>({workflowApi:{days:vi.fn(),saveDay:vi.fn()}}));
vi.mock('../dates',async importOriginal=>({...await importOriginal<typeof import('../dates')>(),todayInSaoPaulo:()=> '2026-11-25'}));
const settings={id:1,companyId:1,halfDayValueCents:10000,updatedAt:'',weekdays:{mondayActive:true,tuesdayActive:true,wednesdayActive:true,thursdayActive:true,fridayActive:true,saturdayActive:false,sundayActive:false}};
afterEach(()=>vi.resetAllMocks());
it('does not mark a failed save as successful',async()=>{
 vi.mocked(workflowApi.days).mockResolvedValue([]);vi.mocked(workflowApi.saveDay).mockRejectedValue(new Error('Servidor indisponível'));
 render(<DailyWorkPage companyId={1} settings={settings}/>);fireEvent.click(await screen.findByRole('button',{name:/Antes do almoço/}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
 expect(screen.getByRole('button',{name:/Antes do almoço/})).toHaveAttribute('aria-pressed','false');
 expect(workflowApi.saveDay).toHaveBeenCalledWith(1,'2026-11-25',true,false);
});
it('hides work buttons on a disabled weekday',async()=>{
 vi.mocked(workflowApi.days).mockResolvedValue([]);render(<DailyWorkPage companyId={1} settings={{...settings,weekdays:{...settings.weekdays,wednesdayActive:false}}}/>);
 expect(await screen.findByText('Hoje não há expediente. Aproveite sua folga!')).toBeVisible();
 expect(screen.queryByRole('button',{name:/Antes do almoço/})).not.toBeInTheDocument();
});
it('reloads canonical state after a lost save response before another write',async()=>{
 const morning={id:1,companyId:1,date:'2026-11-25',workedBeforeLunch:true,workedAfterLunch:false,beforeLunchValueCents:10000,afterLunchValueCents:null};
 vi.mocked(workflowApi.days).mockResolvedValueOnce([]).mockResolvedValue([morning]);
 vi.mocked(workflowApi.saveDay).mockRejectedValueOnce(new Error('Resposta perdida')).mockResolvedValue({...morning,workedAfterLunch:true,afterLunchValueCents:10000});
 render(<DailyWorkPage companyId={1} settings={settings}/>);
 fireEvent.click(await screen.findByRole('button',{name:/Antes do almoço/}));
 await waitFor(()=>expect(workflowApi.days).toHaveBeenCalledTimes(2));
 fireEvent.click(await screen.findByRole('button',{name:/Depois do almoço/}));
 await waitFor(()=>expect(workflowApi.saveDay).toHaveBeenLastCalledWith(1,'2026-11-25',true,true));
});
