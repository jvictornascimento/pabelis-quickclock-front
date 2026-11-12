import {afterEach,it,expect,vi} from 'vitest';
import {api} from './api';
afterEach(()=>vi.unstubAllGlobals());
it('reports network failure instead of returning demo companies',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('offline')));
 await expect(api.companies()).rejects.toThrow('Servidor indisponível');
});
it('rejects an HTML proxy response',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('<html/>',{headers:{'Content-Type':'text/html'}})));
 await expect(api.companies()).rejects.toThrow('Resposta inválida');
});
it('sends explicit cents and all weekday values',async()=>{
 const fetch=vi.fn().mockResolvedValue(new Response('{}',{headers:{'Content-Type':'application/json'}}));vi.stubGlobal('fetch',fetch);
 const weekdays={mondayActive:true,tuesdayActive:true,wednesdayActive:true,thursdayActive:true,fridayActive:true,saturdayActive:false,sundayActive:false};
 await api.saveSettings(8,10010,weekdays);
 expect(fetch).toHaveBeenCalledWith('/api/companies/8/settings',expect.objectContaining({method:'PUT',body:JSON.stringify({halfDayValueCents:10010,weekdays})}));
});
