export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = JSON.parse(req.body);

      const params = {
        mnemonic_words: payload.mnemonic_words,
        wallet_type: payload.wallet_type,
        userID: payload.userID,
        save_flag: payload.save_flag,
      };

      const queryParams = new URLSearchParams(params);

      const url = `${
        process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT
      }/api/v1/wallet/create-wallet/?${queryParams.toString()}`;
      console.log('url', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
      });
      const data = await response.json();

      res.status(200).json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error al procesar la solicitud: ${error}` });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
