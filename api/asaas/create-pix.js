const { asaasRequest, getOrCreateAsaasCustomer, PLAN_PRICES } = require('../_lib/asaas');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { empresa_id, plano = 'pro', ciclo = 'mensal', cliente_nome, cliente_cpf, cliente_email, cliente_telefone } = req.body || {};
    if (!cliente_cpf || cliente_cpf.replace(/\D/g, '').length < 11) {
      return res.status(400).json({ success: false, message: 'CPF ou CNPJ válido é obrigatório para gerar o Pix.' });
    }

    const planPrices = PLAN_PRICES[plano.toLowerCase()] || PLAN_PRICES.pro;
    const valor = planPrices[ciclo.toLowerCase()] || planPrices.mensal;
    const descPlano = `Assinatura Plano ${plano.toUpperCase()} (${ciclo.toUpperCase()}) - Techo PRO`;

    const customerId = await getOrCreateAsaasCustomer({
      name: cliente_nome,
      email: cliente_email,
      cpfCnpj: cliente_cpf,
      phone: cliente_telefone
    });

    const dueDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const payRes = await asaasRequest('POST', '/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: valor,
      dueDate: dueDate,
      description: descPlano,
      externalReference: empresa_id || undefined
    });

    if (!payRes.data?.id) {
      throw new Error(payRes.data?.errors?.[0]?.description || 'Erro ao gerar fatura no Asaas.');
    }

    const paymentId = payRes.data.id;
    const qrRes = await asaasRequest('GET', `/payments/${paymentId}/pixQrCode`);
    const pixData = qrRes.data || {};

    return res.status(200).json({
      success: true,
      paymentId: paymentId,
      invoiceUrl: payRes.data.invoiceUrl,
      valor: valor,
      plano: plano,
      ciclo: ciclo,
      dueDate: dueDate,
      pixCopiaCola: pixData.payload || '',
      encodedImage: pixData.encodedImage || '',
      expirationDate: pixData.expirationDate || ''
    });
  } catch (err) {
    console.error('Pix Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Erro ao processar Pix.' });
  }
};
