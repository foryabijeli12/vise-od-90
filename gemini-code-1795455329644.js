exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=15'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const apiKey = process.env.SPORTS_API_KEY;
  const apiUrl = process.env.SPORTS_API_URL;

  // Ako još nisi dodao stvarni API URL i ključ u Netlify Environment Variables,
  // vrati neutralan odgovor bez lažnih ili zastarjelih podataka.
  if (!apiKey || !apiUrl) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        liveSourceConnected: false,
        updatedAt: new Date().toISOString(),
        message: 'API izvor nije povezan. Postavi SPORTS_API_URL i SPORTS_API_KEY na Netlifyju ili unesi podatke kola.'
      })
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          liveSourceConnected: false,
          updatedAt: new Date().toISOString(),
          message: 'Vanjski API trenutno nije dostupan (HTTP ' + response.status + ').'
        })
      };
    }

    const rawData = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        liveSourceConnected: true,
        updatedAt: new Date().toISOString(),
        raw: rawData
      })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        liveSourceConnected: false,
        updatedAt: new Date().toISOString(),
        message: 'Greška pri spajanju na vanjski izvor podataka.'
      })
    };
  }
};