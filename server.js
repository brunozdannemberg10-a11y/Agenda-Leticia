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

      const cleanCpf = cliente_cpf.replace(/\D/g, '');
      const cleanPhone = cliente_telefone ? cliente_telefone.replace(/\D/g, '') : '';
      const planPrices = PLAN_PRICES[plano.toLowerCase()] || PLAN_PRICES.pro;
      const valor = planPrices[ciclo.toLowerCase()] || planPrices.mensal;
      const descPlano = `Assinatura Plano ${plano.toUpperCase()} (${ciclo.toUpperCase()}) - Techo PRO`;

      // 1. Criar ou Obter Cliente no Asaas
      console.log(`[Asaas] Criando/buscando cliente: ${cliente_nome} (${cleanCpf})...`);
      const custRes = await asaasRequest('POST', '/customers', {
        name: cliente_nome || 'Cliente Techo PRO',
        email: cliente_email || 'cliente@techopro.com.br',
        cpfCnpj: cleanCpf,
        mobilePhone: cleanPhone || undefined,
        notificationDisabled: true
      });

      let customerId = custRes.data?.id;
      if (!customerId && custRes.data?.errors) {
        console.log('[Asaas] Cliente já existente ou erro, buscando pelo CPF...');
        const findCust = await asaasRequest('GET', `/customers?cpfCnpj=${cleanCpf}`);
        if (findCust.data?.data && findCust.data.data.length > 0) {
          customerId = findCust.data.data[0].id;
        } else {
          throw new Error(custRes.data.errors[0]?.description || 'Erro ao cadastrar cliente no Asaas.');
        }
      }

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
      const isPaid = (status === 'RECEIVED' || status === 'CONFIRMED');

      // Se pago e tiver empresaId, ativa a assinatura no Supabase
      if (isPaid && empresaId) {
        try {
          await supabaseRequest('POST', '/assinaturas', {
            empresa_id: empresaId,
            plano: plano,
            ciclo: ciclo,
            status: 'ativo',
            trial_ends_at: null,
            asaas_subscription_id: paymentId
          });
          console.log(`[Supabase] 🎉 Empresa ${empresaId} ATIVADA no plano ${plano.toUpperCase()} (${ciclo})!`);
        } catch (dbErr) {
          console.warn('[Supabase] Aviso ao atualizar assinatura:', dbErr.message);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        paymentId: paymentId,
        status: status,
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
        if (empresaId) {
          await supabaseRequest('POST', '/assinaturas', {
            empresa_id: empresaId,
            status: 'ativo',
            plano: 'pro',
            asaas_subscription_id: payment.id
          });
          console.log(`[Webhook] Assinatura da empresa ${empresaId} ativada via Webhook Asaas!`);
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
