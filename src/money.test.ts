import {describe,it,expect} from 'vitest';
import {parseMoney} from './money';
describe('money in cents',()=>{
 it.each([['0,00',0],['0,01',1],['100,10',10010],['12.5',1250]])('converts %s without rounding errors',(value,cents)=>expect(parseMoney(value)).toBe(cents));
 it.each(['','-1','1,001','abc','9007199254740992'])('rejects invalid amount %s',value=>expect(()=>parseMoney(value)).toThrow());
});
