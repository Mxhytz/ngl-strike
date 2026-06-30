const https = require('https');
const zlib = require('zlib');

const options = {
  hostname: 'ngl.link',
  path: '/api/submit',
  method: 'POST',
  headers: {
    'Host': 'ngl.link',
    'Cookie': '_ga=GA1.1.417634206.1759046753; __stripe_mid=f1fe83e9-4b1a-464b-a5d5-e49cc600fe8fa52d30; __stripe_sid=44a9fce7-9f8b-4b3c-a4ec-9a24932d84d86e6da4; mp_e8e1a30fe6d7dacfa1353b45d6093a00_mixpanel=%7B%22distinct_id%22%3A%22%24device%3A868ce811-3ef9-42dc-9bea-5f7ab96a66f8%22%2C%22%24device_id%22%3A%22868ce811-3ef9-42dc-9bea-5f7ab96a66f8%22%2C%22%24initial_referrer%22%3A%22%24direct%22%2C%22%24initial_referring_domain%22%3A%22%24direct%22%2C%22__mps%22%3A%7B%7D%2C%22__mpso%22%3A%7B%22%24initial_referrer%22%3A%22%24direct%22%2C%22%24initial_referring_domain%22%3A%22%24direct%22%7D%2C%22__mpus%22%3A%7B%7D%2C%22__mpa%22%3A%7B%7D%2C%22__mpu%22%3A%7B%7D%2C%22__mpr%22%3A%5B%5D%2C%22__mpap%22%3A%5B%5D%7D; _ga_5DV1ZR5ZHG=GS2.1.s1782738099$o2$g1$t1782740137$j49$l0$h0',
    'Content-Length': '111',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Sec-Ch-Ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
    'Sec-Ch-Ua-Mobile': '?0',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://ngl.link',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://ngl.link/skibiditoilet143161',
    'Accept-Encoding': 'gzip, deflate, br', // We accept Brotli
    'Priority': 'u=1, i',
  },
};

const postData = 'username=skibiditoilet143161&question=tesssss&deviceId=842ed565-c6d9-49e9-9cb2-53f125156216&gameSlug=&referrer=';

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  let chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    let body;
    if (res.headers['content-encoding'] === 'br') {
      // Brotli decompress
      body = zlib.brotliDecompressSync(buffer).toString('utf8');
    } else if (res.headers['content-encoding'] === 'gzip') {
      body = zlib.gunzipSync(buffer).toString('utf8');
    } else if (res.headers['content-encoding'] === 'deflate') {
      body = zlib.inflateSync(buffer).toString('utf8');
    } else {
      body = buffer.toString('utf8');
    }
    console.log('Body (decompressed):', body);
    try {
      const json = JSON.parse(body);
      console.log('Parsed JSON:', json);
    } catch (_) {
      // Not JSON
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(postData);
req.end();