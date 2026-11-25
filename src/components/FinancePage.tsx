import {useEffect, useRef, useState, type FormEvent, type ReactNode} from 'react';
import {ArrowDownLeft, ArrowUpRight, Check, CreditCard, Pencil, Plus, RefreshCw, RotateCcw, Trash2, X} from 'lucide-react';
import {financeApi} from '../finance-api';
import type {Card, EditScope, Expense, FinanceSummary, IncomeSourceType, PaymentMethod, PendingIncome} from '../finance-types';
import {formatMoney, parseMoney} from '../money';
import {currentMonth, todayInSaoPaulo} from '../dates';
import '../finance.css';

const sources: Record<IncomeSourceType, string> = {WORK_REPORT: 'Relatório de trabalho', ADDITIONAL_SERVICE: 'Serviço adicional', APPROVED_ESTIMATE: 'Orçamento aprovado'};
const methods: Record<PaymentMethod, string> = {CASH: 'Dinheiro', PIX: 'Pix', DEBIT: 'Débito', CREDIT_CARD: 'Cartão de crédito', OTHER: 'Outro'};
const displayDate = (date: string) => date.slice(0, 10).split('-').reverse().join('/');
type Editor = {kind: 'expense'; expense?: Expense} | {kind: 'card'; card?: Card} | {kind: 'income'; source: PendingIncome} | {kind: 'pay'; expense: Expense};
type Save = (action: () => Promise<unknown>, message: string) => Promise<void>;

function Action({label, children, onClick, disabled = false}: {label: string; children: ReactNode; onClick: () => void; disabled?: boolean}) {
 return <button type="button" className="finance-icon" title={label} aria-label={label} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function FinancePage() {
 const [month, setMonth] = useState(currentMonth);
 const [data, setData] = useState<FinanceSummary | null>(null);
 const [cards, setCards] = useState<Card[]>([]);
 const [loading, setLoading] = useState(true), [error, setError] = useState(''), [writeError, setWriteError] = useState('');
 const [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
 const [editor, setEditor] = useState<Editor | null>(null);
 const saving = useRef(false);
 const editorRef = useRef<HTMLElement>(null);
 useEffect(() => {if (editor) editorRef.current?.querySelector<HTMLInputElement>('input')?.focus();}, [editor]);
 useEffect(() => {
  const controller = new AbortController();
  setLoading(true); setError(''); setData(null);
  Promise.all([financeApi.summary(month, controller.signal), financeApi.cards(controller.signal)])
   .then(([summary, list]) => {if (!controller.signal.aborted) {setData(summary); setCards(list);}})
   .catch((reason: Error) => {if (!controller.signal.aborted) setError(reason.message);})
   .finally(() => {if (!controller.signal.aborted) setLoading(false);});
  return () => controller.abort();
 }, [month, revision]);
 const save: Save = async (action, message) => {
  if (saving.current) return;
  saving.current = true; setBusy(true); setWriteError(''); setNotice('');
  try {await action(); setEditor(null); setNotice(message); setRevision(value => value + 1);}
  catch (reason) {setWriteError(reason instanceof Error ? reason.message : 'Não foi possível salvar. Tente novamente.');}
  finally {saving.current = false; setBusy(false);}
 };
 function open(next: Editor) {setWriteError(''); setNotice(''); setEditor(next);}
 return <section className="finance-page" aria-label="Financeiro global">
  <div className="finance-heading"><h2>Resumo mensal</h2><label>Mês financeiro<input type="month" value={month} required disabled={busy} onChange={event => {if (/^\d{4}-\d{2}$/.test(event.target.value)) {setMonth(event.target.value); setEditor(null); setNotice(''); setWriteError('');}}}/></label></div>
  {notice && <p role="status" className="success">{notice}</p>}
  {writeError && <p role="alert" className="error">{writeError}</p>}
  {loading && <p role="status">Carregando financeiro…</p>}
  {error && <div role="alert" className="error"><p>{error}</p><button type="button" className="finance-command" onClick={() => setRevision(value => value + 1)}><RefreshCw size={16}/>Tentar novamente</button></div>}
  {!loading && !error && data && <>
   <dl className="finance-totals">{[
    ['Recebido', data.incomeCents], ['A receber', data.expectedIncomeCents], ['Despesas pagas', data.expenseCents],
    ['Despesas previstas', data.expectedExpenseCents], ['Saldo realizado', data.balanceCents], ['Saldo previsto', data.projectedBalanceCents],
   ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatMoney(Number(value))}</dd></div>)}</dl>
   {editor && <section ref={editorRef} className="finance-editor" aria-label="Lançamento financeiro">
    <div className="finance-heading"><h2>{editor.kind === 'expense' ? (editor.expense ? 'Editar despesa' : 'Nova despesa') : editor.kind === 'card' ? (editor.card ? 'Editar cartão' : 'Novo cartão') : editor.kind === 'income' ? 'Recebimento integral' : 'Pagamento da despesa'}</h2><Action label="Cancelar edição" disabled={busy} onClick={() => setEditor(null)}><X size={18}/></Action></div>
    {editor.kind === 'expense' && <ExpenseForm key={editor.expense?.id ?? 'new'} expense={editor.expense} cards={cards} busy={busy} save={save}/>}
    {editor.kind === 'card' && <CardForm key={editor.card?.id ?? 'new'} card={editor.card} busy={busy} save={save}/>}
    {editor.kind === 'income' && <DatedForm label="Data do recebimento" command="Confirmar recebimento integral" busy={busy} onSave={date => save(() => financeApi.receive(editor.source, date), 'Recebimento registrado.')}><p>{editor.source.companyName} · {sources[editor.source.sourceType]} · {editor.source.description} · <strong>{formatMoney(editor.source.amountCents)}</strong></p></DatedForm>}
    {editor.kind === 'pay' && <DatedForm label="Data do pagamento" command="Confirmar pagamento" busy={busy} onSave={date => save(() => financeApi.payExpense(editor.expense.id, date), 'Pagamento registrado.')}><p>{editor.expense.description} · {formatMoney(editor.expense.amountCents)}</p></DatedForm>}
   </section>}
   <CompanyBreakdown incomes={data.incomes} pendingIncome={data.pendingIncome}/>
   <section className="finance-section" aria-label="A receber"><h2>A receber</h2>
    {data.pendingIncome.length === 0 && <p className="finance-empty">Nenhum recebimento pendente neste mês.</p>}
    <ul className="finance-list">{data.pendingIncome.map(source => <li key={`${source.companyId}-${source.sourceType}-${source.sourceId}`}><div><strong>{source.description}</strong><small>{source.companyName} · {sources[source.sourceType]} · Origem #{source.sourceId} · {displayDate(source.date)}</small></div><b>{formatMoney(source.amountCents)}</b><Action label={`Receber ${source.description}`} disabled={busy} onClick={() => open({kind: 'income', source})}><ArrowDownLeft size={18}/></Action></li>)}</ul>
   </section>
   <section className="finance-section" aria-label="Recebimentos"><h2>Recebimentos</h2>
    {data.incomes.length === 0 && <p className="finance-empty">Nenhum recebimento registrado neste mês.</p>}
    <ul className="finance-list">{data.incomes.map(income => <li key={income.id}><div><strong>{income.description}</strong><small>{income.companyName} · {sources[income.sourceType]} · Origem #{income.sourceId} · {displayDate(income.incomeDate)}</small></div><b>{formatMoney(income.amountCents)}</b><Action label={`Estornar ${income.description}`} disabled={busy} onClick={() => {if (window.confirm(`Estornar o recebimento de ${income.description}? A origem voltará a ficar pendente.`)) void save(() => financeApi.reverse(income.companyId, income.id), 'Recebimento estornado.');}}><RotateCcw size={18}/></Action></li>)}</ul>
   </section>
   <section className="finance-section" aria-label="Pagamentos do mês"><h2>Pagamentos do mês</h2>
    {data.paidExpenses.length === 0 && <p className="finance-empty">Nenhum pagamento registrado neste mês.</p>}
    <ul className="finance-list">{data.paidExpenses.map(expense => <li key={expense.id}><div><strong>{expense.description}</strong><small>Pago em {expense.paidAt ? displayDate(expense.paidAt) : 'data não informada'} · Vencimento {displayDate(expense.date)}</small><small>{expense.category || 'Sem categoria'} · {methods[expense.paymentMethod]}{expense.cardId !== null ? ` · ${cards.find(card => card.id === expense.cardId)?.name ?? `Cartão #${expense.cardId}`}` : ''} · Parcela {expense.installmentNumber}/{expense.installmentTotal}</small></div><b>{formatMoney(expense.amountCents)}</b></li>)}</ul>
   </section>
   <section className="finance-section" aria-label="Despesas"><div className="finance-heading"><h2>Despesas com vencimento no mês</h2><button type="button" className="finance-command" disabled={busy} onClick={() => open({kind: 'expense'})}><Plus size={17}/>Nova despesa</button></div>
    {data.expenses.length === 0 && <p className="finance-empty">Nenhuma despesa neste mês.</p>}
    <ul className="finance-list">{data.expenses.map(expense => <li key={expense.id}><div><strong>{expense.description}</strong><small>{displayDate(expense.date)} · {expense.category || 'Sem categoria'} · {methods[expense.paymentMethod]}{expense.cardId !== null ? ` · ${cards.find(card => card.id === expense.cardId)?.name ?? `Cartão #${expense.cardId}`}` : ''} · Parcela {expense.installmentNumber}/{expense.installmentTotal}</small><small>{expense.paid ? `Paga${expense.paidAt ? ` em ${displayDate(expense.paidAt)}` : ''}` : 'Em aberto'}</small></div><b>{formatMoney(expense.amountCents)}</b>{!expense.paid && <div className="finance-actions"><Action label={`Pagar ${expense.description}`} disabled={busy} onClick={() => open({kind: 'pay', expense})}><ArrowUpRight size={18}/></Action><Action label={`Editar ${expense.description}`} disabled={busy} onClick={() => open({kind: 'expense', expense})}><Pencil size={17}/></Action><Action label={`Excluir ${expense.description}`} disabled={busy} onClick={() => {if (window.confirm(`Excluir somente a parcela ${expense.installmentNumber}/${expense.installmentTotal} de ${expense.description}?`)) void save(() => financeApi.deleteExpense(expense.id), 'Despesa excluída.');}}><Trash2 size={17}/></Action></div>}</li>)}</ul>
   </section>
   {data.expenses.length > 0 && <div className="finance-breakdowns"><h2>Parcelas do mês</h2><ExpenseBreakdown label="Despesas por categoria" expenses={data.expenses} groupBy={expense => expense.category || 'Sem categoria'}/><ExpenseBreakdown label="Despesas por pagamento" expenses={data.expenses} groupBy={expense => methods[expense.paymentMethod]}/><ExpenseBreakdown label="Despesas por cartão" expenses={data.expenses.filter(expense => expense.cardId !== null)} groupBy={expense => cards.find(card => card.id === expense.cardId)?.name ?? `Cartão #${expense.cardId}`}/></div>}
   <section className="finance-section" aria-label="Cartões"><div className="finance-heading"><h2>Cartões</h2><button type="button" className="finance-command" disabled={busy} onClick={() => open({kind: 'card'})}><Plus size={17}/>Novo cartão</button></div>
    {cards.length === 0 && <p className="finance-empty">Nenhum cartão cadastrado.</p>}
    <ul className="finance-list">{cards.map(card => <li key={card.id}><CreditCard size={20}/><div><strong>{card.name}</strong><small>Fechamento: dia {card.closingDay} · Vencimento: dia {card.dueDay}</small></div><Action label={`Editar cartão ${card.name}`} disabled={busy} onClick={() => open({kind: 'card', card})}><Pencil size={17}/></Action></li>)}</ul>
   </section>
  </>}
 </section>;
}

function CompanyBreakdown({incomes, pendingIncome}: Pick<FinanceSummary, 'incomes' | 'pendingIncome'>) {
 const companies = new Map<number, {name: string; received: number; pending: number}>();
 for (const [entries, field] of [[incomes, 'received'], [pendingIncome, 'pending']] as const) {
  for (const entry of entries) {
   const totals = companies.get(entry.companyId) ?? {name: entry.companyName, received: 0, pending: 0};
   totals[field] += entry.amountCents;
   companies.set(entry.companyId, totals);
  }
 }
 if (companies.size === 0) return null;
 return <section className="finance-section" aria-label="Receitas por empresa"><h2>Receitas por empresa</h2><ul className="finance-list">{Array.from(companies, ([id, totals]) => <li key={id}><div><strong>{totals.name}</strong><small>Recebido · {formatMoney(totals.received)}</small><small>Pendente · {formatMoney(totals.pending)}</small></div></li>)}</ul></section>;
}

function ExpenseBreakdown({label, expenses, groupBy}: {label: string; expenses: Expense[]; groupBy: (expense: Expense) => string}) {
 const groups = new Map<string, {paid: number; unpaid: number}>();
 for (const expense of expenses) {
  const key = groupBy(expense);
  const total = groups.get(key) ?? {paid: 0, unpaid: 0};
  total[expense.paid ? 'paid' : 'unpaid'] += expense.amountCents;
  groups.set(key, total);
 }
 return <section aria-label={label}><h3>{label}</h3>{groups.size === 0 ? <p className="finance-empty">Nenhuma parcela.</p> : <dl>{Array.from(groups, ([name, totals]) => <div key={name}><dt>{name}</dt><dd><span>Pagas · {formatMoney(totals.paid)}</span><span>Em aberto · {formatMoney(totals.unpaid)}</span></dd></div>)}</dl>}</section>;
}

function DatedForm({label, command, children, busy, onSave}: {label: string; command: string; children: ReactNode; busy: boolean; onSave: (date: string) => Promise<void>}) {
 const [date, setDate] = useState(todayInSaoPaulo);
 return <form onSubmit={event => {event.preventDefault(); void onSave(date);}}>{children}<label>{label}<input type="date" value={date} max={todayInSaoPaulo()} required disabled={busy} onChange={event => setDate(event.target.value)}/></label><button className="primary" disabled={busy}><Check size={17}/>{busy ? 'Salvando…' : command}</button></form>;
}

function ExpenseForm({expense, cards, busy, save}: {expense?: Expense; cards: Card[]; busy: boolean; save: Save}) {
 const [description, setDescription] = useState(expense?.description ?? ''), [amount, setAmount] = useState(expense ? (expense.amountCents / 100).toFixed(2).replace('.', ',') : '');
 const [category, setCategory] = useState(expense?.category ?? ''), [date, setDate] = useState(todayInSaoPaulo);
 const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX'), [cardId, setCardId] = useState('');
 const [installments, setInstallments] = useState(1), [scope, setScope] = useState<EditScope>('ONE'), [error, setError] = useState('');
 function submit(event: FormEvent) {
  event.preventDefault(); setError('');
  let amountCents: number;
  try {amountCents = parseMoney(amount); if (!description.trim()) throw new Error('Informe a descrição.');}
  catch (reason) {setError((reason as Error).message); return;}
  if (expense) {
   if (!window.confirm(scope === 'UNPAID' ? 'Aplicar a todas as parcelas em aberto? As parcelas pagas serão preservadas.' : 'Salvar somente esta parcela? As demais parcelas, inclusive as pagas, serão preservadas.')) return;
   void save(() => financeApi.editExpense(expense.id, scope, {description: description.trim(), amountCents, category: category.trim() || null}), 'Despesa atualizada.');
  } else {
   void save(() => financeApi.createExpense({description: description.trim(), date, amountCents, category: category.trim() || null, paymentMethod, cardId: paymentMethod === 'CREDIT_CARD' ? Number(cardId) : null, installmentTotal: installments}), 'Despesa cadastrada.');
  }
 }
 return <form onSubmit={submit}><fieldset disabled={busy}><div className="finance-fields">
  <label>Descrição<input required maxLength={255} value={description} onChange={event => setDescription(event.target.value)}/></label>
  <label>{expense ? 'Valor da parcela (R$)' : 'Valor total (R$)'}<input inputMode="decimal" required value={amount} onChange={event => setAmount(event.target.value)}/></label>
  <label>Categoria<input maxLength={120} value={category} onChange={event => setCategory(event.target.value)}/></label>
  {expense ? <label>Aplicar alteração<select value={scope} onChange={event => setScope(event.target.value as EditScope)}><option value="ONE">Somente esta parcela</option><option value="UNPAID">Todas as parcelas em aberto</option></select></label> : <>
   <label>Data da despesa<input type="date" required value={date} onChange={event => setDate(event.target.value)}/></label>
   <label>Forma de pagamento<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value as PaymentMethod)}>{Object.entries(methods).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
   {paymentMethod === 'CREDIT_CARD' && <label>Cartão<select value={cardId} required onChange={event => setCardId(event.target.value)}><option value="">Selecione</option>{cards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}</select></label>}
   <label>Número de parcelas<input type="number" min="1" max="1200" step="1" required value={installments} onChange={event => setInstallments(Number(event.target.value))}/></label>
  </>}
 </div></fieldset>{error && <p role="alert" className="error">{error}</p>}<button className="primary" disabled={busy}><Check size={17}/>{busy ? 'Salvando…' : 'Salvar despesa'}</button></form>;
}

function CardForm({card, busy, save}: {card?: Card; busy: boolean; save: Save}) {
 const [name, setName] = useState(card?.name ?? ''), [closingDay, setClosingDay] = useState(card?.closingDay ?? 1), [dueDay, setDueDay] = useState(card?.dueDay ?? 10);
 return <form onSubmit={event => {event.preventDefault(); if (name.trim()) void save(() => financeApi.saveCard({name: name.trim(), closingDay, dueDay}, card?.id), 'Cartão salvo.');}}><fieldset disabled={busy}><div className="finance-fields"><label>Nome do cartão<input required maxLength={120} value={name} onChange={event => setName(event.target.value)}/></label><label>Dia do fechamento<input type="number" min="1" max="31" step="1" required value={closingDay} onChange={event => setClosingDay(Number(event.target.value))}/></label><label>Dia do vencimento<input type="number" min="1" max="31" step="1" required value={dueDay} onChange={event => setDueDay(Number(event.target.value))}/></label></div></fieldset><button className="primary" disabled={busy || !name.trim()}><Check size={17}/>{busy ? 'Salvando…' : 'Salvar cartão'}</button></form>;
}
