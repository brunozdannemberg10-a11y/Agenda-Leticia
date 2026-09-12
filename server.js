const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 1. Simple .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const ASAAS_KEY = process.env.ASAAS_API_KEY;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = process.env.PORT || 3000;

// Helper: Make Asaas API request
function asaasRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.asaas.com',
      port: 443,
      path: '/v3' + endpoint,
      method: method,
      headers: {
        'access_token': ASAAS_KEY,
        'User-Agent': 'TechoPRO-SaaS'
      }
    };
    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Helper: Make Supabase REST request
function supabaseRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'pqwtzpvzihbehxymxpct.supabase.co',
      port: 443,
      path: '/rest/v1' + endpoint,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Plan Prices Map
const PLAN_PRICES = {
  'starter': {
    'mensal': 29.90,
    'semestral': 149.40,
    'anual': 262.80
  },
  'pro': {
    'mensal': 59.90,
    'semestral': 299.40,
    'anual': 538.80
  }
};

// Parse JSON Body Helper
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper: Obter ou cadastrar cliente no Asaas com deduplicação por CPF/CNPJ
async function getOrCreateAsaasCustomer({ name, email, cpfCnpj, phone, postalCode, addressNumber }) {
  const cleanCpf = (cpfCnpj || '').replace(/\D/g, '');
  const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;
  const cleanCep = postalCode ? postalCode.replace(/\D/g, '') : undefined;

  // 1. Busca por CPF/CNPJ existente
  if (cleanCpf) {
    const findCust = await asaasRequest('GET', `/customers?cpfCnpj=${cleanCpf}`);
    if (findCust.data?.data && findCust.data.data.length > 0) {
      const existing = findCust.data.data[0];
      if (cleanCep || addressNumber) {
        await asaasRequest('POST', `/customers/${existing.id}`, {
          postalCode: cleanCep || existing.postalCode,
          addressNumber: addressNumber || existing.addressNumber
        });
      }
      return existing.id;
    }
  }

  // 2. Criação de novo cliente
  const custRes = await asaasRequest('POST', '/customers', {
    name: name || 'Cliente Techo PRO',
    email: email || 'contato@techopro.com.br',
    cpfCnpj: cleanCpf,
    mobilePhone: cleanPhone || undefined,
    postalCode: cleanCep || undefined,
    addressNumber: addressNumber || undefined,
    notificationDisabled: true
  });

  if (custRes.data?.id) {
    return custRes.data.id;
  }

  if (custRes.data?.errors) {
    throw new Error(custRes.data.errors[0]?.description || 'Erro ao cadastrar cliente no Asaas.');
  }

  throw new Error('Falha ao processar cliente no Asaas.');
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // =========================================================================
  // API ROUTE: Criar Cobrança Pix no Asaas
  // =========================================================================
  if (pathname === '/api/asaas/create-pix' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { empresa_id, plano = 'pro', ciclo = 'mensal', cliente_nome, cliente_cpf, cliente_email, cliente_telefone } = body;

      if (!cliente_cpf || cliente_cpf.replace(/\D/g, '').length < 11) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'CPF ou CNPJ válido é obrigatório para gerar o Pix.' }));
        return;
      }

      const planPrices = PLAN_PRICES[plano.toLowerCase()] || PLAN_PRICES.pro;
      const valor = planPrices[ciclo.toLowerCase()] || planPrices.mensal;
      const descPlano = `Assinatura Plano ${plano.toUpperCase()} (${ciclo.toUpperCase()}) - Techo PRO`;

      // 1. Obter ou Criar Cliente no Asaas
      const customerId = await getOrCreateAsaasCustomer({
        name: cliente_nome,
        email: cliente_email,
        cpfCnpj: cliente_cpf,
        phone: cliente_telefone
      });

      // 2. Criar Cobrança Pix no Asaas
      const dueDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Vence amanhã
      console.log(`[Asaas] Gerando cobrança Pix de R$ ${valor} para cliente ${customerId}...`);
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
      const invoiceUrl = payRes.data.invoiceUrl;

      // 3. Obter QR Code Pix e Payload Copia e Cola
      console.log(`[Asaas] Obtendo QR Code Pix para pagamento ${paymentId}...`);
      const qrRes = await asaasRequest('GET', `/payments/${paymentId}/pixQrCode`);
      const pixData = qrRes.data || {};

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        paymentId: paymentId,
        invoiceUrl: invoiceUrl,
        valor: valor,
        plano: plano,
        ciclo: ciclo,
        dueDate: dueDate,
        pixCopiaCola: pixData.payload || '',
        encodedImage: pixData.encodedImage || '',
        expirationDate: pixData.expirationDate || ''
      }));

    } catch (err) {
      console.error('[API Error /create-pix]:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: err.message || 'Erro interno ao processar Pix.' }));
    }
    return;
  }

  // =========================================================================
  // API ROUTE: Processar Pagamento com Cartão de Crédito no Asaas
  // =========================================================================
  if (pathname === '/api/asaas/create-card' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const {
        empresa_id,
        plano = 'pro',
        ciclo = 'mensal',
        cliente_nome,
        cliente_cpf,
        cliente_email,
        cliente_telefone,
        card_number,
        card_holder,
        card_expiry_month,
        card_expiry_year,
        card_ccv,
        postal_code,
        address_number,
        installments = 1
      } = body;

      if (!card_number || !card_holder || !card_expiry_month || !card_expiry_year || !card_ccv) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Preencha todos os dados do cartão de crédito (número, titular, validade e CVV).' }));
        return;
      }

      if (!cliente_cpf || cliente_cpf.replace(/\D/g, '').length < 11) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'CPF ou CNPJ do titular é obrigatório.' }));
        return;
      }

      const planPrices = PLAN_PRICES[plano.toLowerCase()] || PLAN_PRICES.pro;
      const valor = planPrices[ciclo.toLowerCase()] || planPrices.mensal;
      const descPlano = `Assinatura Plano ${plano.toUpperCase()} (${ciclo.toUpperCase()}) - Techo PRO`;

      // 1. Obter ou cadastrar cliente com dados de faturamento
      const customerId = await getOrCreateAsaasCustomer({
        name: cliente_nome || card_holder,
        email: cliente_email,
        cpfCnpj: cliente_cpf,
        phone: cliente_telefone,
        postalCode: postal_code,
        addressNumber: address_number
      });

      // 2. Preparar dados do cartão
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
        paymentPayload.installmentCount = numInstallments;
        paymentPayload.installmentValue = +(valor / numInstallments).toFixed(2);
      }

      console.log(`[Asaas] Processando Cartão de Crédito R$ ${valor} (${numInstallments}x) para ${customerId}...`);
      const payRes = await asaasRequest('POST', '/payments', paymentPayload);

      if (!payRes.data?.id) {
        const errorMsg = payRes.data?.errors?.[0]?.description || 'Transação não autorizada. Verifique os dados do cartão ou limite disponível.';
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: errorMsg }));
        return;
      }

      const paymentData = payRes.data;
      const isPaid = (paymentData.status === 'CONFIRMED' || paymentData.status === 'RECEIVED');

      // Se aprovado imediatamente e tiver empresa_id, ativa no Supabase
      if (isPaid && empresa_id) {
        try {
          await supabaseRequest('POST', '/assinaturas', {
            empresa_id: empresa_id,
            plano: plano.toLowerCase(),
            ciclo: ciclo.toLowerCase(),
            status: 'ativo',
            metodo_pagamento: 'CREDIT_CARD',
            trial_ends_at: null,
            asaas_subscription_id: paymentData.id
          });
          console.log(`[Supabase] 🎉 Empresa ${empresa_id} ATIVADA com Cartão no plano ${plano.toUpperCase()} (${ciclo})!`);
        } catch (dbErr) {
          console.warn('[Supabase] Aviso ao registrar assinatura:', dbErr.message);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        paymentId: paymentData.id,
        status: paymentData.status,
        isPaid: isPaid,
        invoiceUrl: paymentData.invoiceUrl,
        brand: paymentData.creditCard?.creditCardBrand || 'Cartão de Crédito',
        lastDigits: paymentData.creditCard?.creditCardNumber || cleanCardNumber.slice(-4),
        valor: valor,
        installments: numInstallments
      }));

    } catch (err) {
      console.error('[API Error /create-card]:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: err.message || 'Erro ao processar cartão de crédito.' }));
    }
    return;
  }

  // =========================================================================
  // API ROUTE: Criar Boleto Bancário no Asaas
  // =========================================================================
  if (pathname === '/api/asaas/create-boleto' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const {
        empresa_id,
        plano = 'pro',
        ciclo = 'mensal',
        cliente_nome,
        cliente_cpf,
        cliente_email,
        cliente_telefone,
        postal_code,
        address_number
      } = body;

      if (!cliente_cpf || cliente_cpf.replace(/\D/g, '').length < 11) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'CPF ou CNPJ válido é obrigatório para emissão de boleto.' }));
        return;
      }

      const planPrices = PLAN_PRICES[plano.toLowerCase()] || PLAN_PRICES.pro;
      const valor = planPrices[ciclo.toLowerCase()] || planPrices.mensal;
      const descPlano = `Assinatura Plano ${plano.toUpperCase()} (${ciclo.toUpperCase()}) - Techo PRO`;

      // 1. Obter ou cadastrar cliente com endereço
      const customerId = await getOrCreateAsaasCustomer({
        name: cliente_nome,
        email: cliente_email,
        cpfCnpj: cliente_cpf,
        phone: cliente_telefone,
        postalCode: postal_code,
        addressNumber: address_number
      });

      // 2. Data de vencimento: 3 dias úteis
      const due = new Date();
      due.setDate(due.getDate() + 3);
      const dueDate = due.toISOString().split('T')[0];

      console.log(`[Asaas] Emitindo Boleto de R$ ${valor} para cliente ${customerId}...`);
      const payRes = await asaasRequest('POST', '/payments', {
        customer: customerId,
        billingType: 'BOLETO',
        value: valor,
        dueDate: dueDate,
        description: descPlano,
        externalReference: empresa_id || undefined
      });

      if (!payRes.data?.id) {
        throw new Error(payRes.data?.errors?.[0]?.description || 'Erro ao emitir boleto no Asaas.');
      }

      const paymentId = payRes.data.id;
      const bankSlipUrl = payRes.data.bankSlipUrl;
      const invoiceUrl = payRes.data.invoiceUrl;

      // 3. Obter linha digitável e código de barras
      let identificationField = '';
      let barCode = '';
      try {
        const idfRes = await asaasRequest('GET', `/payments/${paymentId}/identificationField`);
        if (idfRes.data) {
          identificationField = idfRes.data.identificationField || '';
          barCode = idfRes.data.barCode || '';
        }
      } catch (e) {
        console.warn('[Asaas] Aviso ao obter linha digitável:', e.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        paymentId: paymentId,
        bankSlipUrl: bankSlipUrl,
        invoiceUrl: invoiceUrl,
        identificationField: identificationField,
        barCode: barCode,
        valor: valor,
        plano: plano,
        ciclo: ciclo,
        dueDate: dueDate
      }));

    } catch (err) {
      console.error('[API Error /create-boleto]:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: err.message || 'Erro ao emitir boleto bancário.' }));
    }
    return;
  }

  // =========================================================================
  // API ROUTE: Verificar Status do Pagamento
  // =========================================================================
  if (pathname === '/api/asaas/check-status' && req.method === 'GET') {
    try {
      const paymentId = parsedUrl.query.paymentId;
      const empresaId = parsedUrl.query.empresaId;
      const plano = (parsedUrl.query.plano || 'pro').toLowerCase();
      const ciclo = (parsedUrl.query.ciclo || 'mensal').toLowerCase();

      if (!paymentId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'paymentId obrigatório.' }));
        return;
      }

      const payRes = await asaasRequest('GET', `/payments/${paymentId}`);
      const status = payRes.data?.status || 'PENDING';
      const billingType = payRes.data?.billingType || 'ASAAS';
      const isPaid = (status === 'RECEIVED' || status === 'CONFIRMED');

      // Se pago e tiver empresaId, ativa a assinatura no Supabase
      if (isPaid && empresaId) {
        try {
          await supabaseRequest('POST', '/assinaturas', {
            empresa_id: empresaId,
            plano: plano,
            ciclo: ciclo,
            status: 'ativo',
            metodo_pagamento: billingType,
            trial_ends_at: null,
            asaas_subscription_id: paymentId
          });
          console.log(`[Supabase] 🎉 Empresa ${empresaId} ATIVADA via ${billingType} no plano ${plano.toUpperCase()} (${ciclo})!`);
        } catch (dbErr) {
          console.warn('[Supabase] Aviso ao atualizar assinatura:', dbErr.message);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        paymentId: paymentId,
        status: status,
        billingType: billingType,
        isPaid: isPaid,
        active: isPaid
      }));

    } catch (err) {
      console.error('[API Error /check-status]:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: err.message }));
    }
    return;
  }

  // =========================================================================
  // API ROUTE: Webhook Oficial Asaas
  // =========================================================================
  if (pathname === '/api/asaas/webhook' && req.method === 'POST') {
    try {
      const event = await parseJsonBody(req);
      console.log('[Asaas Webhook] Evento recebido:', event.event, 'ID:', event.payment?.id);

      if (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') {
        const payment = event.payment;
        const empresaId = payment?.externalReference;
        const billingType = payment?.billingType || 'ASAAS';
        if (empresaId) {
          await supabaseRequest('POST', '/assinaturas', {
            empresa_id: empresaId,
            status: 'ativo',
            plano: 'pro',
            metodo_pagamento: billingType,
            asaas_subscription_id: payment.id
          });
          console.log(`[Webhook] Assinatura da empresa ${empresaId} ativada via Webhook Asaas (${billingType})!`);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    } catch (err) {
      console.error('[Webhook Error]:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(__dirname, safePath);

  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 TECHO PRO SERVER ATIVO EM http://localhost:${PORT}`);
  console.log(`💳 Asaas API Integrada: Checkout Pix, Status & Webhooks`);
  console.log(`====================================================`);
});
