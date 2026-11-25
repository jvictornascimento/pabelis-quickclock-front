import {it,expect} from 'vitest';
import {todayInSaoPaulo} from './dates';
it('keeps Sao Paulo civil date across midnight',()=>{
 expect(todayInSaoPaulo(new Date('2026-11-01T02:59:59Z'))).toBe('2026-10-31');
 expect(todayInSaoPaulo(new Date('2026-11-01T03:00:00Z'))).toBe('2026-11-01');
});
