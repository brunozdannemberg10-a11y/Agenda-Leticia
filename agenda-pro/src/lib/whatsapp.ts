import { Appointment, SaleTransaction, BusinessConfig } from './types';
import { formatCurrency, formatDateBR } from './utils';

export function getWhatsAppLink(phone: string, message: string): string {
  const cleanedPhone = phone.replace(/\D/g, '');
  const targetPhone = cleanedPhone.startsWith('55') ? cleanedPhone : `55${cleanedPhone}`;
  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;
}

export function generateConfirmationMessage(
  appointment: Appointment,
  config: BusinessConfig
): string {
  const servicos = appointment.services.map((s) => s.serviceName).join(' + ');
  const data = formatDateBR(appointment.date);
  const hora = appointment.startTime;
  const total = formatCurrency(appointment.totalPrice);

  let template = config.whatsappConfirmationTemplate;
  if (!template) {
    template =
      "Olá {cliente}! ✨ Seu agendamento de *{servicos}* no Studio {empresa} está confirmado para o dia *{data}* às *{hora}*. Total: {total}. Te esperamos! 💅";
  }

  return template
    .replace(/{cliente}/g, appointment.clientName)
    .replace(/{servicos}/g, servicos)
    .replace(/{data}/g, data)
    .replace(/{hora}/g, hora)
    .replace(/{total}/g, total)
    .replace(/{empresa}/g, config.name);
}

export function generateReminderMessage(
  appointment: Appointment,
  config: BusinessConfig
): string {
  const servicos = appointment.services.map((s) => s.serviceName).join(' + ');
  const data = formatDateBR(appointment.date);
  const hora = appointment.startTime;

  let template = config.whatsappReminderTemplate;
  if (!template) {
    template =
      "Olá {cliente}! 🌸 Passando para lembrar do seu horário dia *{data}* às *{hora}* para *{servicos}*. Confirmado? Te aguardo!";
  }

  return template
    .replace(/{cliente}/g, appointment.clientName)
    .replace(/{servicos}/g, servicos)
    .replace(/{data}/g, data)
    .replace(/{hora}/g, hora)
    .replace(/{empresa}/g, config.name);
}

export function generateReceiptMessage(
  sale: SaleTransaction,
  config: BusinessConfig
): string {
  const servicos = sale.items.map((i) => i.description).join(', ');
  const total = formatCurrency(sale.total);
  const pagamento = sale.payments
    .map((p) => {
      const names: Record<string, string> = {
        pix: 'PIX',
        dinheiro: 'Dinheiro',
        debito: 'Cartão de Débito',
        credito: 'Cartão de Crédito',
        credito_cliente: 'Saldo de Crédito',
        outro: 'Outro'
      };
      return `${names[p.method] || p.method} (${formatCurrency(p.amount)})`;
    })
    .join(' + ');

  let template = config.whatsappReceiptTemplate;
  if (!template) {
    template =
      "Olá {cliente}! 🧾 Segue o comprovante do seu atendimento no {empresa}.\n\n✨ Serviços: {servicos}\n💰 Total: {total}\nForma de Pagamento: {pagamento}\n\nMuito obrigado pela preferência e até a próxima! 💖";
  }

  return template
    .replace(/{cliente}/g, sale.clientName)
    .replace(/{servicos}/g, servicos)
    .replace(/{total}/g, total)
    .replace(/{pagamento}/g, pagamento)
    .replace(/{empresa}/g, config.name);
}
