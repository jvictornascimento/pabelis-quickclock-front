import type {MonthlyReport} from './workflow-types';
import {formatDate} from './dates';
import {formatMoney} from './money';

export async function downloadReport(report: MonthlyReport) {
  const [{jsPDF}, {default: autoTable}] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const pdf = new jsPDF();
  pdf.setFontSize(20); pdf.text('Relatório mensal', 15, 20);
  pdf.setFontSize(12);
  const companyLines = pdf.splitTextToSize(report.companyName, 180);
  pdf.text(companyLines, 15, 30);
  const monthY = 33 + companyLines.length * 5;
  pdf.text(report.month.split('-').reverse().join('/'), 15, monthY);
  let y = monthY + 8;
  const table = (head: string[], body: string[][]) => {
    autoTable(pdf, {startY: y, head: [head], body, theme: 'grid', headStyles: {fillColor: [22, 115, 77]}, styles: {fontSize: 10, cellPadding: 3}, margin: {left: 15, right: 15}});
    y = (pdf as typeof pdf & {lastAutoTable: {finalY: number}}).lastAutoTable.finalY + 12;
  };
  table(['Data', 'Manhã', 'Tarde'], report.workDays.map(day => [formatDate(day.date), day.workedBeforeLunch ? 'Sim' : 'Não', day.workedAfterLunch ? 'Sim' : 'Não']));
  for (const [title, entries] of [['Serviços adicionais', report.additionalServices], ['Orçamentos aprovados', report.approvedEstimates]] as const) {
    if (!entries.length) continue;
    if (y > 245) {pdf.addPage(); y = 20;}
    pdf.text(title, 15, y); y += 5;
    table(['Data', 'Descrição', 'Valor'], entries.map(entry => [formatDate('approvedAt' in entry ? entry.approvedAt || entry.date : entry.date), entry.description, formatMoney(entry.amountCents)]));
  }
  if (y > 235) {pdf.addPage(); y = 20;}
  table(['Resumo', ''], [['Dias trabalhados', String(report.workedDays)], ['Períodos', String(report.workedPeriods)], ['Trabalho', formatMoney(report.workDaysValueCents)], ['Serviços', formatMoney(report.additionalServicesValueCents)], ['Orçamentos', formatMoney(report.approvedEstimatesValueCents)], ['Total', formatMoney(report.totalValueCents)]]);
  if (y > 250) {pdf.addPage(); y = 20;}
  table(['Recebimento deste relatório', ''], [['Recebido', formatMoney(report.receivedValueCents)], ['Pendente', formatMoney(report.pendingValueCents)]]);
  pdf.save(`QuickClock-${report.companyId}-${report.month}.pdf`);
}
