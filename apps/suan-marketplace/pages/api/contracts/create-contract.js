import { getOracleWalletId } from "@marketplaces/data-access";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud
      const script_type = payload.script_type;

      const oracleWalletId = await getOracleWalletId(
        process.env['NEXT_PUBLIC_MARKETPLACE_NAME'].toLowerCase()
      );

      if (!oracleWalletId) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
      }

      let payloadFixed = {
        name: payload.name,
        wallet_id: payload.wallet_id,
        tokenName: payload.tokenName,
        save_flag: payload.save_flag,
        oracle_wallet_id: oracleWalletId,
      };

      if (
        script_type === 'spendProject' ||
        script_type === 'mintProjectToken'
      ) {
        payloadFixed.project_id = payload.project_id;
      }
      if (script_type === 'spendProject') {
        payloadFixed.parent_policy_id = payload.parent_policy_id;
      }

      const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/contracts/create-contract/${script_type}`;

      const queryParams = new URLSearchParams(payloadFixed);

      const urlWithParams = `${url}?${queryParams.toString()}`;
      console.log(urlWithParams);

      const response = await fetch(urlWithParams, {
        method: 'GET',
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
