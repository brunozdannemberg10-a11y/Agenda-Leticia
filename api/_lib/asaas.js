const https = require('https');

const ASAAS_KEY = process.env.ASAAS_API_KEY;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

async function getOrCreateAsaasCustomer({ name, email, cpfCnpj, phone, postalCode, addressNumber }) {
  const cleanCpf = (cpfCnpj || '').replace(/\D/g, '');
  const cleanPhone = phone ? phone.replace(/\D/g, '') : undefined;
  const cleanCep = postalCode ? postalCode.replace(/\D/g, '') : undefined;

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

  const custRes = await asaasRequest('POST', '/customers', {
    name: name || 'Cliente Techo PRO',
    email: email || 'contato@techopro.com.br',
    cpfCnpj: cleanCpf,
    mobilePhone: cleanPhone || undefined,
    postalCode: cleanCep || undefined,
    addressNumber: addressNumber || undefined,
    notificationDisabled: true
  });

  if (custRes.data?.id) return custRes.data.id;
  if (custRes.data?.errors) throw new Error(custRes.data.errors[0]?.description || 'Erro ao cadastrar cliente no Asaas.');
  throw new Error('Falha ao processar cliente no Asaas.');
}

module.exports = {
  asaasRequest,
  supabaseRequest,
  getOrCreateAsaasCustomer,
  PLAN_PRICES
};
