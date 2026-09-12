const { asaasRequest, supabaseRequest, getOrCreateAsaasCustomer, PLAN_PRICES } = require('../_lib/asaas');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const {
      empresa_id, plano = 'pro', ciclo = 'mensal', cliente_nome, cliente_cpf, cliente_email, cliente_telefone,
      card_number, card_holder, card_expiry_month, card_expiry_year, card_ccv, postal_code, address_number, installments = 1
    } = req.body || {};

    if (!card_number || !card_holder || !card_expiry_month || !card_expiry_year || !card_ccv) {
      return res.status(400).json({ success: false, message: 'Preencha todos os dados do cartão de crédito.' });
    }
    if (!cliente_cpf || cliente_cpf.replace(/\D/g, '').length < 11) {
      return res.status(400).json({ success: false, message: 'CPF ou CNPJ do titular é obrigatório.' });
    }

    const planPrices = PLAN_PRICES[plano.toLowerCase()] || PLAN_PRICES.pro;
    const valor = planPrices[ciclo.toLowerCase()] || planPrices.mensal;
    const descPlano = `Assinatura Plano ${plano.toUpperCase()} (${ciclo.toUpperCase()}) - Techo PRO`;

    const customerId = await getOrCreateAsaasCustomer({
      name: cliente_nome || card_holder,
      email: cliente_email,
      cpfCnpj: cliente_cpf,
      phone: cliente_telefone,
      postalCode: postal_code,
      addressNumber: address_number
    });

    const cleanCardNumber = card_number.replace(/\D/g, '');
    const cleanCpf = cliente_cpf.replace(/\D/g, '');
    const cleanPhone = cliente_telefone ? cliente_telefone.replace(/\D/g, '') : '11999999999';
    const cleanCep = postal_code ? postal_code.replace(/\D/g, '') : '01310100';
    const formattedYear = String(card_expiry_year).trim().length === 2 ? `20${String(card_expiry_year).trim()}` : String(card_expiry_year).trim();
    const formattedMonth = String(card_expiry_month).trim().padStart(2, '0');

    const paymentPayload = {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      value: valor,
      dueDate: new Date().toISOString().split('T')[0],
      description: descPlano,
      externalReference: empresa_id || undefined,
      creditCard: {
        holderName: card_holder.trim().toUpperCase(),
        number: cleanCardNumber,
        expiryMonth: formattedMonth,
        expiryYear: formattedYear,
        ccv: String(card_ccv).trim()
      },
      creditCardHolderInfo: {
        name: card_holder.trim().toUpperCase(),
        email: cliente_email || 'contato@techopro.com.br',
        cpfCnpj: cleanCpf,
        postalCode: cleanCep,
        addressNumber: (address_number || '100').trim(),
        phone: cleanPhone
      }
    };

    const numInstallments = parseInt(installments, 10);
    if (numInstallments > 1) {
      delete paymentPayload.value;
      paymentPayload.totalValue = valor;
      paymentPayload.installmentCount = numInstallments;
    }

    const payRes = await asaasRequest('POST', '/payments', paymentPayload);
    if (!payRes.data?.id) {
      const errorMsg = payRes.data?.errors?.[0]?.description || 'Transação não autorizada. Verifique os dados do cartão.';
      return res.status(400).json({ success: false, message: errorMsg });
    }

    const paymentData = payRes.data;
    const isPaid = (paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED');

    if (isPaid && empresa_id) {
      try {
        await supabaseRequest('PATCH', `/assinaturas?empresa_id=eq.${empresa_id}`, {
          plano: plano.toLowerCase(),
          ciclo: ciclo.toLowerCase(),
          status: 'ativo',
          metodo_pagamento: 'CREDIT_CARD',
          trial_ends_at: null,
          asaas_subscription_id: paymentData.id,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('Supabase update warning:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      paymentId: paymentData.id,
      status: paymentData.status,
      isPaid: isPaid,
      invoiceUrl: paymentData.invoiceUrl,
      brand: paymentData.creditCard?.creditCardBrand || 'Cartão de Crédito',
      lastDigits: paymentData.creditCard?.creditCardNumber || cleanCardNumber.slice(-4),
      valor: valor,
      installments: numInstallments
    });
  } catch (err) {
    console.error('Card Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Erro ao processar cartão.' });
  }
};
