import { updateMarketplaceConfig } from '@marketplaces/data-access';
import { error } from 'console';

export default async function handler(req, res) {
  const payload = req.body; // Utiliza req.body en lugar de req.query para obtener datos del cuerpo de la solicitud

  try {
    // Generación de token de acceso

    const urlSendAccessToken = `${
      process.env['NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT']
    }/api/v1/helpers/send-access-token/?wallet_id=${
      payload.walletID
    }&destinAddress=${payload.walletAddress}&marketplace_id=${process.env[
      'NEXT_PUBLIC_MARKETPLACE_NAME'
    ]?.toLocaleLowerCase()}&save_flag=true`;

    const responseSendAccessToken = await fetch(urlSendAccessToken, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env['NEXT_PUBLIC_API_KEY_ENDPOINT'] || '',
      },
    });
    const sendAccesTokenResponse = await responseSendAccessToken.json();

    // Generación de mnemonic_words
    const urlGenerateWords = `${process.env['NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT']}/api/v1/wallet/generate-words/?size=24`;
    const responseGenerateWords = await fetch(urlGenerateWords, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env['NEXT_PUBLIC_API_KEY_ENDPOINT'] || '',
      },
    });
    const mnemonic_words = await responseGenerateWords.json();

    // Creación de wallet
    const paramsCreateWallet = {
      mnemonic_words: mnemonic_words,
      wallet_type: 'oracle',
      userID: '',
      save_flag: true,
    };
    console.log('paramsCreateWallet', paramsCreateWallet);
    const queryParamsCreateWallet = new URLSearchParams(paramsCreateWallet);
    const urlCreateWallet = `${
      process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT
    }/api/v1/wallet/create-wallet/?${queryParamsCreateWallet.toString()}`;

    const responseCreateWallet = await fetch(urlCreateWallet, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env['NEXT_PUBLIC_API_KEY_ENDPOINT'] || '',
      },
    });
    const createWalletResponse = await responseCreateWallet.json();
    console.log('createWalletResponse', createWalletResponse);


    const oracleTokenName =
      `${process.env['NEXT_PUBLIC_MARKETPLACE_NAME']}ORACLE${process.env['NEXT_PUBLIC_ENV']}`.toUpperCase();

    await updateMarketplaceConfig(createWalletResponse.wallet_id, oracleTokenName);

    // Creación de token Oraculo

    const paramsCreateOracleDatum = {
      core_wallet_id: payload.walletID,
      oracle_wallet_id: createWalletResponse.wallet_id,
      oracle_token_name: oracleTokenName,
    };
    console.log('paramsCreateOracleDatum', paramsCreateOracleDatum);
    const queryParamsCreateOracleDatum = new URLSearchParams(
      paramsCreateOracleDatum
    );
    const urlCreateOracleDatum = `${
      process.env['NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT']
    }/api/v1/helpers/oracle-datum/Create?${queryParamsCreateOracleDatum.toString()}`;

    const responseCreateOracle = await fetch(urlCreateOracleDatum, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env['NEXT_PUBLIC_API_KEY_ENDPOINT'] || '',
      },
      body: JSON.stringify({ data: [], validity: 86400000 }),
    });
    const createOracleResponse = await responseCreateOracle.json();
    console.log('createOracleResponse', createOracleResponse);

    console.log('sendAccesTokenResponse', sendAccesTokenResponse);
    console.log('createOracleResponse', createOracleResponse);
    res.status(200).json({
      sendAccesToken: sendAccesTokenResponse,
      createOracle: createOracleResponse,
    });
  } catch (error) {
    console.error('Error configurando marketplace:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}
