addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Tangani preflight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }
  
  // Tangani GET: Mengembalikan state terakhir yang tersimpan di KV
  if (request.method === 'GET') {
    const state = await STATE_KV.get('currentState', { type: 'json' });
    return new Response(JSON.stringify(state || {}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // Untuk POST: ambil body JSON
  let body = {};
  try {
    if (request.method === 'POST') {
      body = await request.json();
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'JSON tidak valid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Variabel tetap untuk pilotLight
  const variables = {
    lightId: '********',
    macAddress: '************',
    provider: 'WiZ'
  };

  // Bagian deklarasi variabel untuk query dan field di dalam state
  let queryVars = '$lightId: String!, $provider: String!, $macAddress: String!';
  let stateFields = '';

  if (body.hasOwnProperty('status')) {
    variables.status = body.status;
    queryVars += ', $status: Boolean!';
    stateFields += 'state: $status, ';
  }
  if (body.hasOwnProperty('brightness')) {
    variables.brightness = body.brightness;
    queryVars += ', $brightness: Int!';
    stateFields += 'dimming: $brightness, ';
  }
  if (body.hasOwnProperty('temperature')) {
    variables.temperature = body.temperature;
    queryVars += ', $temperature: Int!';
    stateFields += 'temperature: $temperature, ';
  }
  // Hanya tambahkan sceneId ke query jika *hanya* scene yang ingin diubah
  if (body.hasOwnProperty('sceneId') && !(body.hasOwnProperty('status') || body.hasOwnProperty('brightness') || body.hasOwnProperty('temperature'))) {
    variables.sceneId = body.sceneId;
    queryVars += ', $sceneId: Int!';
    stateFields += 'sceneId: $sceneId, ';
  }
  
  // Pastikan ada setidaknya satu field yang ingin diubah
  if (!stateFields) {
    return new Response(JSON.stringify({ error: "Tidak ada parameter yang valid" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Hapus koma di akhir string jika ada
  if (stateFields.endsWith(', ')) {
    stateFields = stateFields.slice(0, -2);
  }
  
  // Susun query GraphQL secara dinamis
  const query = `mutation (${queryVars}) {
    pilotLight(lightId: $lightId, mac: $macAddress, provider: $provider, state: { ${stateFields} })
  }`;
  
  const payload = {
    operationName: null,
    variables: variables,
    query: query
  };
  
  const url = 'https://api.pro.wizconnected.com/graphql';
  
  const headers = {
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    'Connection': 'keep-alive',
    'Origin': 'https://pro.wizconnected.com',
    'Referer': 'https://pro.wizconnected.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'accept': '*/*',
    'content-type': 'application/json',
    'organizationId': 'clcx25uwp713x08125prfsrwr',
    'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Cookie': '****************************************************************************'
  };
  
  const init = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  };
  
  try {
    const response = await fetch(url, init);
    const text = await response.text();
  
    // Perbarui state di KV
    const kvKey = 'currentState';
    let currentState = await STATE_KV.get(kvKey, { type: 'json' });
    if (!currentState) {
      currentState = { status: false, brightness: 50, temperature: 4600, sceneId: null };
    }
    if (body.hasOwnProperty('status')) {
      currentState.status = body.status;
    }
    if (body.hasOwnProperty('brightness')) {
      currentState.brightness = body.brightness;
    }
    if (body.hasOwnProperty('temperature')) {
      currentState.temperature = body.temperature;
    }
    // Jika terjadi perubahan pada status, brightness, atau temperature, reset scene ke null
    if (body.hasOwnProperty('status') || body.hasOwnProperty('brightness') || body.hasOwnProperty('temperature')) {
      currentState.sceneId = null;
    } else if (body.hasOwnProperty('sceneId')) {
      currentState.sceneId = body.sceneId;
    }
    await STATE_KV.put(kvKey, JSON.stringify(currentState));
  
    return new Response(text, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
