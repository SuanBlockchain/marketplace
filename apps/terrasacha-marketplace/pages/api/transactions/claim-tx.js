import {
  createTransaction,
  getOracleWalletId,
} from '@marketplaces/data-access';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud

      const claim_redeemer = payload.claim_redeemer;

      const oracleWalletId = await getOracleWalletId(
        process.env['NEXT_PUBLIC_MARKETPLACE_NAME'].toLowerCase()
      );

      if (!oracleWalletId) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
      }

      const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/transactions/claim-tx/${claim_redeemer}?oracle_wallet_id=${oracleWalletId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || '',
        },
        body: JSON.stringify(payload.payload),
      });

      const data = await response.json();

      // Crear transaccion
      if (data?.success) {
        // Si es claim / Compra, adderss origin es del contrato
        // En caso de compra addressdestination wallet conectada

        let newTransactionPayload = {
          addressOrigin: '',
          addressDestination: JSON.stringify(''),
          walletID: payload.transactionPayload.walletID,
          txIn: JSON.stringify(data.build_tx.inputs),
          txOutput: JSON.stringify(data.build_tx.outputs),
          txCborhex: data.cbor,
          txHash: data.build_tx.tx_id,
          mint: JSON.stringify(data.build_tx.mint),
          scriptDataHash: data.build_tx.script_data_hash,
          metadataUrl: data.metadata_cbor,
          redeemer: claim_redeemer,
          fees: data.build_tx.fee,
          network: 'testnet',
          type: 'buyTokens',
          productID: payload.transactionPayload.productID,
          signed: false,
        };

        if (claim_redeemer === 'Buy' || claim_redeemer === 'Unlist') {
          newTransactionPayload.addressOrigin =
            payload.transactionPayload.contractAddressOrigin;
          newTransactionPayload.addressDestination = JSON.stringify(
            payload.transactionPayload.walletAddress
          );
        }

        const newTransaction = await createTransaction(newTransactionPayload);
        console.log('newTransaction', newTransaction);

        res.status(200).json({ ...data, transaction_id: newTransaction.id });
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
