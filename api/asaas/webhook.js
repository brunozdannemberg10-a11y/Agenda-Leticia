const { supabaseRequest } = require('../_lib/asaas');
const ASAAS_WEBHOOK_SECRET = process.env.ASAAS_WEBHOOK_SECRET;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const tokenHeader = req.headers['asaas-access-token'];
    if (ASAAS_WEBHOOK_SECRET && tokenHeader !== ASAAS_WEBHOOK_SECRET) {
      console.warn('[Asaas Webhook] ⚠️ Tentativa de acesso não autorizada ao webhook!');
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    const event = req.body || {};
    console.log('[Asaas Webhook] Evento recebido:', event.event, 'ID:', event.payment?.id);

    if (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') {
      const payment = event.payment;
      const empresaId = payment?.externalReference;
      const billingType = payment?.billingType || 'ASAAS';
      if (empresaId) {
        await supabaseRequest('PATCH', `/assinaturas?empresa_id=eq.${empresaId}`, {
          status: 'ativo',
          metodo_pagamento: billingType,
          trial_ends_at: null,
          asaas_subscription_id: payment.id,
          updated_at: new Date().toISOString()
        });
        console.log(`[Webhook] 🎉 Assinatura da empresa ${empresaId} ATIVADA via Webhook Asaas (${billingType})!`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
