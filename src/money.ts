export const formatMoney=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export function parseMoney(value:string):number{
  const normalized=value.trim();
  if(!/^\d+(?:[,.]\d{1,2})?$/.test(normalized))throw new Error('Informe um valor válido com até duas casas decimais.');
  const [whole,decimal='']=normalized.replace(',','.').split('.');
  const cents=Number(whole)*100+Number(decimal.padEnd(2,'0'));
  if(!Number.isSafeInteger(cents))throw new Error('Valor acima do limite permitido.');
  return cents;
}
