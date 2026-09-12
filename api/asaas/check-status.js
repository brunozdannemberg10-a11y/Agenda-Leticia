const { asaasRequest, supabaseRequest } = require('../_lib/asaas');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const paymentId = req.query.paymentId;
    const empresaId = req.query.empresaId;
    const plano = (req.query.plano || 'pro').toLowerCase();
    const ciclo = (req.query.ciclo || 'mensal').toLowerCase();

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'paymentId obrigatório.' });
    }

    const payRes = await asaasRequest('GET', `/payments/${paymentId}`);
    const status = payRes.data?.status || 'PENDING';
    const billingType = payRes.data?.billingType || 'ASAAS';
    const isPaid = (status === 'RECEIVED' || status === 'CONFIRMED');

    if (payRes.data?.externalReference && empresaId && payRes.data.externalReference !== empresaId) {
      return res.status(403).json({ success: false, message: 'Fatura vinculada a outra empresa.' });
    }

    if (isPaid && empresaId) {
      try {
        await supabaseRequest('PATCH', `/assinaturas?empresa_id=eq.${empresaId}`, {
          plano: plano,
          ciclo: ciclo,
          status: 'ativo',
          metodo_pagamento: billingType,
          trial_ends_at: null,
          asaas_subscription_id: paymentId,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('Supabase status check warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      paymentId: paymentId,
      status: status,
      billingType: billingType,
      isPaid: isPaid,
      active: isPaid
    });
  } catch (err) {
    console.error('Check Status Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
