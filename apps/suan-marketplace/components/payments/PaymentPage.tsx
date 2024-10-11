'use client';
import Card from '@marketplaces/ui-lib/src/lib/common/Card';
import EpaycoCheckout from '@marketplaces/ui-lib/src/lib/epayco/EpaycoCheckout';
import { LoadingIcon } from '@marketplaces/ui-lib/src/lib/icons/LoadingIcon';
import PendingVerificationMessage from '@marketplaces/ui-lib/src/lib/common/PendingVerificationMessage';
import SignTransactionModal from '@marketplaces/ui-lib/src/lib/wallet/sign-transaction/SignTransactionModal';
import { useContext, useEffect, useRef, useState } from 'react';
import { TokenDetailSection } from './TokenDetailSection';
import { Button, TextInput } from 'flowbite-react';
import { BlockChainIcon } from '../icons/BlockChainIcon';
/* import { useWallet } from '@meshsdk/react'; */
import { coingeckoPrices } from '@suan/utils/suan/oracle';
import { getIpfsUrlHash } from '@suan/utils/generic/ipfs';
import { featureMapping } from '@suan/utils/suan/mappings';
import {
  splitLongValues,
  txHashLink,
} from '@suan/utils/generic/conversions';
/* import { createMintingTransaction, sign } from '@marketplaces/data-access'; */
/* import { BlockfrostProvider } from '@meshsdk/core'; */
import Link from 'next/link';
import { cardanoscan } from '@suan/backend/mint';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { getCurrentUser } from 'aws-amplify/auth';
import ProjectInfoContext from '@suan/store/projectinfo-context';
import { useRouter } from 'next/router';

const PURCHASE_STEPS = {
  BUYING: 'buying',
  PREVIEW: 'preview',
  PAYING: 'paying',
};

const PAYING_STEPS = {
  STARTING: 'starting',
  PROCESSING: 'processing',
  FINISHED: 'finished',
  ERROR: 'error',
};

export default function PaymentPage({}) {
  /* const { wallet, connected } = useWallet(); */
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [validationError, setValidationError] = useState<any>('');
  const [transactionStatusMessage, setTransactionStatusMessage] =
    useState<string>('');
  const [purchaseStep, setPurchaseStep] = useState<string>(
    PURCHASE_STEPS.BUYING
  );
  const [payingStep, setPayingStep] = useState<string>(PAYING_STEPS.STARTING);
  const [actualScriptId, setActualScriptId] = useState<string | null>(null);

  const { projectInfo } = useContext<any>(ProjectInfoContext);
  const {
    walletID,
    walletAddress,
    walletStakeAddress,
    walletBySuan,
    walletData,
    walletAvailableBalance,
    fetchWalletData,
  } = useContext<any>(WalletContext);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [availableTokenAmount, setAvailableTokenAmount] = useState<
    number | null
  >(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [invoiceID, setInvoiceID] = useState<string>(
    String(Math.floor(Math.random() * (3999999 - 1)) + 1)
  );

  const [alertMessage, setAlertMessage] = useState<{
    type: string;
    title: string;
    message: string;
    visible: boolean;
  }>({
    type: '',
    title: '',
    message: '',
    visible: false,
  });
  const isRouteChanging = useRef(false);

  const router = useRouter();
  const handleRouteChangeStart = () => {
    isRouteChanging.current = true;
  };

  router.events.on('routeChangeStart', handleRouteChangeStart);

  let blockFrostKeysPreview: string;
  if (process.env.NEXT_PUBLIC_blockFrostKeysPreview) {
    blockFrostKeysPreview = process.env.NEXT_PUBLIC_blockFrostKeysPreview;
  } else {
    throw new Error(
      `Parameter ${process.env['blockFrostKeysPreview']} not found`
    );
  }
  /* const blockfrostProvider = new BlockfrostProvider(blockFrostKeysPreview); */
  console.log('projectInfo', projectInfo);
  // const IPFSUrlHash = getIpfsUrlHash(projectInfo.categoryID);
  const IPFSUrlHash = getIpfsUrlHash('REDD+');

  const tokenImageUrl = `https://coffee-dry-barnacle-850.mypinata.cloud/ipfs/${IPFSUrlHash}`;
  console.log('tokenImageUrl', tokenImageUrl);

  const validateTokenAmount = () => {
    if (parseInt(tokenAmount) <= 0 || isNaN(parseInt(tokenAmount))) {
      toast.error('Ingresa una cantidad valida ...');
      return false;
    }

    if (!Number.isInteger(parseFloat(tokenAmount))) {
      toast.error('Ingresa una cantidad entera de tokens ...');
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (alertMessage.visible) {
      setTimeout(() => {
        setAlertMessage({
          type: '',
          title: '',
          message: '',
          visible: false,
        });
      }, 4000);
    }
  }, [alertMessage]);

  const getAvailableTokens = async (
    spendContractAddress: string,
    tokenName: string,
    tokenContractId: string
  ) => {
    const response = await fetch(
      '/api/calls/backend/getWalletBalanceByAddress',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spendContractAddress),
      }
    );
    const spentWalletData = await response.json();

    console.log('spendData', spentWalletData);
    console.log('tokenName', tokenName);
    console.log('tokenContractId', tokenContractId);

    if (!spentWalletData) {
      toast.error('Parece que un error ha ocurrido ...');
    }

    const availableTokensAmount = spentWalletData.assets.reduce(
      (sum: number, item: any) => {
        if (
          item.asset_name === tokenName &&
          item.policy_id === tokenContractId
        ) {
          return sum + parseInt(item.quantity);
        }
      },
      0
    );
    console.log('availableTokensAmount', availableTokensAmount);
    setAvailableTokenAmount(availableTokensAmount);
    return availableTokensAmount;
  };

  useEffect(() => {
    if (projectInfo.scripts.length > 0) {
      // Obtener del endpoint de luis la cantidad de tokens disponibles para comprar
      const mintProjectTokenContract = projectInfo.scripts.find(
        (script: any) =>
          script.script_type === 'mintProjectToken' && script.Active === true
      );

      console.log('mintProjectTokenContract', mintProjectTokenContract);

      const spendContractFromMintProjectToken = projectInfo.scripts.find(
        (script: any) =>
          script.script_type === 'spendProject' && script.Active === true
      );

      setActualScriptId(spendContractFromMintProjectToken.id);

      if (mintProjectTokenContract && spendContractFromMintProjectToken) {
        getAvailableTokens(
          spendContractFromMintProjectToken.testnetAddr,
          mintProjectTokenContract.token_name,
          mintProjectTokenContract.id
        );
      }
    }
  }, [projectInfo]);

  useEffect(() => {
    async function getCoingeckoPrices() {
      try {
        const adaUsdMeanRate = await coingeckoPrices(
          'cardano',
          projectInfo.tokenCurrency
        );
        setExchangeRate(adaUsdMeanRate);
      } catch (error) {
        console.error(error);
      }
    }
    if (!exchangeRate && projectInfo.tokenCurrency) getCoingeckoPrices();
  }, [exchangeRate, projectInfo]);

  const handleSetTokenAmount = async (value: string) => {
    setValidationError('');
    setTokenAmount(value);
  };

  const validateConditions = async () => {
    // Validar que usuario es verificado

    try {
      const { userId } = await getCurrentUser();

      const validateUser = await validateValidUser(userId, 'crypto');

      if (!validateUser) {
        return false;
      }
    } catch (error) {
      Swal.fire({
        title: 'Validación de correo pendiente',
        text: 'Debes completar una verificación de identidad antes de poder realizar una compra.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, quiero verificarme!',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const url = `https://identity.truora.com/preview/IPFe5575f69c6c12802870e66a8e5f6a94c?trigger_user=neider.smith1%40gmail.com&account_id=${walletID}`;
          window.open(url);
        }
      });
      return false;
    }
    // Otras validaciones
    console.log(walletData.balance);
    if (!validateTokenAmount()) {
      return false;
    }

    if (!availableTokenAmount) {
      toast.error('Parece que ha ocurrido un error ...');
      return false;
    }
    if (availableTokenAmount < parseInt(tokenAmount)) {
      setValidationError(
        <>
          <span className="font-medium">Oops!</span> la cantidad de tokens que
          deseas comprar no se encuentra disponible
        </>
      );
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Ingresa una cantidad valida.',
        visible: true,
      });
      return false;
    }
    if (!tokenAmount || tokenAmount <= '0') {
      setValidationError(
        <>
          <span className="font-medium">Oops!</span> no has ingresado una
          cantidad valida
        </>
      );
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: 'Ingresa una cantidad valida.',
        visible: true,
      });
      return false;
    }
    if (totalADA * 1000000 > walletAvailableBalance) {
      const rest = walletAvailableBalance / parseFloat(projectInfo.token.oraclePrice)
      setAlertMessage({
        type: 'failure',
        title: 'Error !',
        message: `Parece que no tienes fondos suficientes. El maximo de tokens que puedes comprar es de ${Math.floor(rest)}`,
        visible: true,
      });
      return false;
    }
    return true;
  };

  const getRates = async () => {
    const response = await fetch('/api/calls/getRates');
    const data = await response.json();
    let dataFormatted: any = {};
    data.map((item: any) => {
      let obj = `ADArate${item.currency}`;
      dataFormatted[obj] = item.value;
    });
    return dataFormatted;
  };

  const getCoreWallet = async () => {
    const response = await fetch('/api/calls/getCoreWallet');
    const data = await response.json();
    console.log('coreWallet', data);
    return data;
  };

  const validateValidUser = async (userId: string, paymentType: string) => {
    const response = await fetch(`/api/validations/validUser?userId=${userId}`);
    const userValidation = await response.json();

    if (userValidation) {
      // if (paymentType === 'crypto') {
      //   if (!userValidation.isValidatedStep1) {
      //     Swal.fire({
      //       title: 'Validación pendiente',
      //       text: 'Debes completar la verificación Basica de identidad antes de poder realizar una compra.',
      //       icon: 'warning',
      //       showCancelButton: true,
      //       confirmButtonColor: '#3085d6',
      //       cancelButtonColor: '#d33',
      //       confirmButtonText: 'Si, quiero verificarme!',
      //       cancelButtonText: 'Cancelar',
      //     }).then(async (result) => {
      //       if (result.isConfirmed) {
      //         const url = `https://identity.truora.com/preview/IPFe5575f69c6c12802870e66a8e5f6a94c?trigger_user=neider.smith1%40gmail.com&account_id=${userId}`;
      //         window.open(url);
      //       }
      //     });
      //     return false;
      //   }
      // }
      if (paymentType === 'fiat') {
        if (!userValidation.isValidatedStep2) {
          Swal.fire({
            title: 'Validación pendiente',
            text: 'Debes completar la verificación Pro de identidad antes de poder realizar una compra.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
          })
          return false;
        }
      }
      return true;
    }

    return false;
  };

  const handlePayment = async () => {
    let userId: any = null;
    try {
      const { userId } = await getCurrentUser();

      const validateUser = await validateValidUser(userId, 'fiat');

      if (!validateUser) {
        return false;
      }
    } catch (error) {
      Swal.fire({
        title: 'Validación de correo pendiente',
        text: 'Debes completar una verificación de identidad antes de poder realizar una compra.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, quiero verificarme!',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const url = `https://identity.truora.com/preview/IPFe5575f69c6c12802870e66a8e5f6a94c?trigger_user=neider.smith1%40gmail.com&account_id=${walletID}`;
          window.open(url);
        }
      });
      return false;
    }

    if (!validateTokenAmount()) {
      return;
    }

    Swal.fire({
      title: 'Estas seguro de realizar la compra?',
      text: 'Seras enviado a la pasarela de pagos sin marcha atras',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, quiero comprar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { userId } = await getCurrentUser();
        // Crear orden de compra en base de datos
        // Calcular precio

        const rates = await getRates();
        const currencyToCryptoRate = parseFloat(
          rates[`ADArate${projectInfo.tokenCurrency.toUpperCase()}`]
        );

        let payload: any = {
          id: invoiceID,
          orderType: 'epayco',
          finalValue:
            parseFloat(projectInfo.tokenPrice) * parseInt(tokenAmount),
          tokenAmount: tokenAmount,
          tokenName: projectInfo.token.tokenName,
          currency: projectInfo.tokenCurrency,
          productID: projectInfo.projectID,
          userID: userId,
          walletAddress: walletAddress,
          walletStakeAddress: walletStakeAddress,
          exchangeRate: currencyToCryptoRate,
        };

        const response = await fetch('/api/calls/backend/createPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const buildTxResponse = await response.json();

        console.log('buildTxResponse - Creación de pago', buildTxResponse);

        setShowCheckout(true);
      }
    });
  };

  const handleBuildTx = async () => {
    // let crypto = 'cardano';
    // let base_currency = projectInfo.tokenCurrency;

    // Convert usd price to Ada price from the internal oracle

    // Obtener conversión a partir de tabla de rates en dynamo
    // const currencyToCryptoRate = await coingeckoPrices(crypto, base_currency); Metodo antiguo

    // const rates = await getRates();
    // const currencyToCryptoRate = parseFloat(
    //   rates[`ADArate${base_currency.toUpperCase()}`]
    // );
    // const adaPrice = parseFloat(projectInfo.tokenPrice) / currencyToCryptoRate;
    // console.log('Valor que paga el usuario por unidad de token: ', adaPrice);
    // console.log('currencyToCryptoRate: ', currencyToCryptoRate);

    if (!validateTokenAmount()) {
      return;
    }

    // Obtener corewallet
    const coreWallet = await getCoreWallet();

    // Traer script relacionado al proyecto para consultar policyID
    const mintProjectTokenContract = projectInfo.scripts.find(
      (script: any) =>
        script.script_type === 'mintProjectToken' && script.Active === true
    );

    const spendContractFromMintProjectToken = projectInfo.scripts.find(
      (script: any) =>
        script.script_type === 'spendProject' && script.Active === true
    );

    // Obtener cantidad de tokens disponibles en el contrato sent

    const availableTokensAmount = await getAvailableTokens(
      spendContractFromMintProjectToken.testnetAddr,
      mintProjectTokenContract.token_name,
      mintProjectTokenContract.id
    );

    console.log(
      'spendContractFromMintProjectToken',
      spendContractFromMintProjectToken
    );
    console.log('availableTokensAmount', availableTokensAmount);
    if (spendContractFromMintProjectToken) {
      // Evaluar si el valor de los adas que le llegan al beneficiario es mayor o igual del numero de tokens * precio
      const payload = {
        claim_redeemer: 'Buy',
        payload: {
          wallet_id: walletID,
          spendPolicyId: spendContractFromMintProjectToken.id,
          addresses: [
            //
            {
              // Obtener Wallet Admin de dynamodb (unico isAdmin = true)
              address: coreWallet.address, // Wallet Admin Address
              lovelace:
                parseInt(tokenAmount) * parseInt(projectInfo.token.oraclePrice), // ,
              multiAsset: [],
            },
            {
              address: walletAddress,
              lovelace: 0,
              multiAsset: [
                {
                  policyid: mintProjectTokenContract.id,
                  tokens: {
                    [mintProjectTokenContract.token_name]:
                      parseInt(tokenAmount),
                  },
                },
              ],
            },
          ],
        },
        transactionPayload: {
          walletID: walletID,
          walletAddress: walletAddress,
          productID: projectInfo.projectID,
          contractAddressOrigin: spendContractFromMintProjectToken.testnetAddr
        },
      };

      console.log('BuildTx Payload: ', payload);

      let success = false;
      const maxRetries = 2; // 3 minutes / 20 seconds = 9 retries
      let retries = 0;

      while (!success && retries <= maxRetries) {
        if (isRouteChanging.current) {
          break; // Si la ruta está cambiando, salir del bucle
        }
        try {
          const request = await fetch('/api/transactions/claim-tx', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          const buildTxResponse = await request.json();
          console.log('BuildTx Response: ', buildTxResponse);

          if (buildTxResponse?.success) {
            return { buildTxResponse, payload };
          } else {
            toast.error('Reintentando ...');
            throw new Error('Build transaction failed');
          }
        } catch (error: any) {
          console.error(
            `Request failed: ${error.message}. Retrying in 20 seconds...`
          );
          retries += 1;
          if (retries <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 20000));
          }
        }
      }

      setPayingStep(PAYING_STEPS.ERROR);
    }
  };

  const handleCreateTransactionStep = async () => {
    // Hacer validaciones posibles
    const conditionValidation = await validateConditions();
    if (!conditionValidation) {
      return;
    }

    // Cambio de Step
    handleStartPaymentStep();
  };

  const handleStartPaymentStep = async () => {
    // Cambio de Step
    setPurchaseStep(PURCHASE_STEPS.PAYING);

    // Llamada a procesador de pago

    if (!walletBySuan) {
      // En caso de que se pague con billetera externa
      /* await startMinting(); */
    } else {
      // En caso de que se pague con billetera interna
      setTxHash('');
      setPayingStep(PAYING_STEPS.PROCESSING);
      setTransactionStatusMessage(
        'Transacción en proceso, una ventana emergente se activará para firmar. Esperando confirmación...'
      );
      // Construcción de transacción

      const build: any = await handleBuildTx();

      if (build && build.buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletAddress,
          buildTxResponse: build.buildTxResponse,
          metadata: {},
        });

        setNewTransactionBuild({
          ...mappedTransactionData,
          scriptId: actualScriptId,
          postDistributionPayload: {
            projectId: projectInfo.projectID,
            projectName: projectInfo.projectName,
            tokenName: projectInfo.token.tokenName,
            tokenAmount: parseInt(tokenAmount),
          },
          retryPayload: build.payload,
          transaction_id: build.buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal();
      }
    }
  };

  const handleOpenSignTransactionModal = (signStatus: boolean = false) => {
    setSignTransactionModal(!signTransactionModal);
    if (!signTransactionModal === false && !signStatus) {
      setPurchaseStep(PURCHASE_STEPS.BUYING);
    }
  };

  const filteredList = projectInfo.projectFeatures
    .filter((item: any) => featureMapping[item.featureID])
    .map((item: any) => {
      const propertyKey = featureMapping[item.featureID];
      if (
        propertyKey === 'D_actual_use' ||
        propertyKey === 'F_nacimiento_agua'
      ) {
        return { [propertyKey]: JSON.parse(item.value) };
      } else {
        return { [propertyKey]: item.value };
      }
    });
  /* const startMinting = async () => {
    // Inicio de compra

    try {
      setTxHash('');
      setPayingStep(PAYING_STEPS.PROCESSING);
      setTransactionStatusMessage(
        'Transacción en proceso, una ventana emergente se activará para firmar. Esperando confirmación...'
      );
      const networkId = await wallet.getNetworkId();
      const recipientAddress = await wallet.getChangeAddress();
      const utxos = await wallet.getUtxos();
      const walletStakeID = await wallet.getRewardAddresses();

      let crypto = 'cardano';
      let base_currency = projectInfo.tokenCurrency;

      // Convert usd price to Ada price from the internal oracle
      const currencyToCryptoRate = await coingeckoPrices(crypto, base_currency);
      const adaPrice =
        parseFloat(projectInfo.tokenPrice) / currencyToCryptoRate;

      console.log('currencyToCryptoRate', currencyToCryptoRate);
      console.log('adaPrice', adaPrice);

      // Get category image from IPFS

      const IPFSUrlHash = getIpfsUrlHash(projectInfo.categoryID);

      const tokenImageUrl = `ipfs://${IPFSUrlHash}`;
      const files = [
        {
          src: tokenImageUrl,
          mediaType: 'image/png',
        },
      ];

      const metadata = {
        project_name: projectInfo.projectName,
        project_id: projectInfo.projectID,
        description: projectInfo.projectDescription,
        createdAt: projectInfo.createdAt,
        category: projectInfo.categoryID,
        files: files,
        image: tokenImageUrl,
        mediaType: 'image/png',
      };

      console.log(metadata);

      filteredList.forEach((obj2: any) => Object.assign(metadata, obj2));

      const truncated_metadata = splitLongValues(metadata);
      console.log('utxos', utxos);
      console.log('recipientAddress', recipientAddress);
      console.log('tokenAmount', tokenAmount);
      console.log('truncated_metadata', truncated_metadata);
      console.log('ada Price', Math.round(adaPrice * 1000000));

      const createMintTransaction = await createMintingTransaction(
        `/mint/create-tx`,
        recipientAddress,
        utxos,
        parseInt(tokenAmount),
        truncated_metadata,
        Math.round(adaPrice * 1000000)
      );

      if (createMintTransaction.status) {
        const {
          maskedTx,
          originalMetadata,
          simpleScriptPolicyID,
          feeAmount,
          costLovelace,
        } = createMintTransaction;

        console.log('feeAmount', feeAmount);
        const signedTx = await wallet.signTx(maskedTx, true);
        setTransactionStatusMessage('Transacción en proceso...');

        const { appWalletSignedTx } = await sign(
          `/mint/sign`,
          signedTx,
          originalMetadata
        );

        console.log(signedTx);
        console.log(originalMetadata);

        const txHashValue = await wallet.submitTx(appWalletSignedTx);

        //8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83 token en hexadecimal
        const createTransactionPayload = {
          productID: projectInfo.projectID,
          stakeAddress: walletStakeID[0],
          policyID: simpleScriptPolicyID,
          addressDestination: recipientAddress,
          addressOrigin:
            'addr_test1vqkge7txl2vdw26efyv7cytjl8l6n8678kz09agc0r34pdss0xtmp', //Desde donde se envian los fondos al usuario ADRESS MASTER,
          amountOfTokens: parseInt(tokenAmount),
          fees: parseInt(feeAmount) / 1000000, //Comision,
          //metadataUrl: JSON.stringify(metadata),
          network: networkId,
          tokenName: projectInfo.token.tokenName,
          txCborhex: signedTx,
          txHash: txHashValue,
          txIn: utxos[0].input.txHash,
          txProcessed: true, // Si se proceso en block chain
          type: 'mint',
        };
        console.log(createTransactionPayload);
        // const createTransactionResult = await createTransaction(
        //   createTransactionPayload
        // );
        const requestOptions = {
          method: 'POST', // Método de solicitud
          headers: {
            'Content-Type': 'application/json', // Tipo de contenido del cuerpo de la solicitud
          },
          body: JSON.stringify(createTransactionPayload), // Datos que se enviarán en el cuerpo de la solicitud
        };

        const createTransactionResult = await fetch(
          '/api/calls/createTransaction',
          requestOptions
        );
        console.log('CreateTranscation: ', createTransactionResult);
        console.log('txHashValue', txHashValue);
        setTxHash(txHashValue);

        setTransactionStatusMessage(
          'Esperando confirmación de la red, por favor no abandone la pagina...'
        );
        blockfrostProvider.onTxConfirmed(txHashValue, async () => {
          setPayingStep(PAYING_STEPS.FINISHED);
          await fetchWalletData();
        });
      } else {
        const { minAdaValue } = createMintTransaction;

        // Calcular cantidad minima que se debe comprar
        const minAssestsToBuy = Math.ceil(
          minAdaValue / Math.round(adaPrice * 1000000)
        );
        setAlertMessage({
          type: 'failure',
          title: 'Error !',
          message: `La cantidad minima de tokens que puedes comprar son ${minAssestsToBuy}`,
          visible: true,
        });

        setValidationError(
          <>
            <span className="font-medium">Oops!</span> la cantidad minima de
            tokens que puedes comprar son {minAssestsToBuy}
          </>
        );

        setPayingStep(PAYING_STEPS.ERROR);
      }
    } catch (error: any) {
      setPayingStep(PAYING_STEPS.ERROR);
    }
  }; */

  const resetSteps = () => {
    setPurchaseStep(PURCHASE_STEPS.BUYING);
    setPayingStep(PAYING_STEPS.STARTING);
    setTokenAmount('');
  };

  const steps = [
    {
      step: 1,
      title: 'Compra',
      description: 'Información de compra',
      id: PURCHASE_STEPS.BUYING,
    },
    {
      step: 2,
      title: 'Pago',
      description: 'Procesamiento de pago',
      id: PURCHASE_STEPS.PAYING,
    },
  ];

  const subTotalUSD =
    parseInt(tokenAmount) * parseFloat(projectInfo.tokenPrice);
  const subTotalADA = parseFloat((subTotalUSD / exchangeRate).toFixed(4));
  const feesUSD = parseFloat((subTotalUSD * 0.05).toFixed(2));
  const feesADA = parseFloat((feesUSD / exchangeRate).toFixed(4));
  const totalUSD = subTotalUSD + feesUSD;
  const totalADA = parseFloat((totalUSD / exchangeRate).toFixed(4));

  return (
    <>
      <PendingVerificationMessage />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* STEPPER */}
        <div className="flex flex-col sm:flex-row rounded-lg space-x-0 sm:space-x-4 space-y-4 sm:space-y-0 col-span-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex w-full items-center justify-center p-4 border space-x-4 rounded-lg shadow-md ${
                purchaseStep === step.id
                  ? 'bg-custom-dark text-amber-400'
                  : 'bg-custom-fondo'
              }`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 border rounded-lg shrink-0 ${
                  purchaseStep === step.id ? 'border-amber-400' : 'border-black'
                }`}
              >
                {step.step}
              </span>
              <span>
                <h3 className="font-medium leading-tight">{step.title}</h3>
                <p className="text-sm">{step.description}</p>
              </span>
            </div>
          ))}
        </div>
        {/* Validation */}
        {alertMessage.visible && (
          <div className="flex items-center w-full p-4 text-black bg-amber-400 rounded-lg shadow col-span-2">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-custom-dark bg-white rounded-lg">
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
              </svg>
              <span className="sr-only">Warning icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">
              {alertMessage.message}
            </div>
          </div>
        )}
        {/* STEP DETAIL */}
        <Card className="col-span-2 w-full">
          <Card.Body>
            {/* Compra */}
            {purchaseStep === PURCHASE_STEPS.BUYING && (
              <div className="space-y-4">
                <TokenDetailSection
                  projectName={projectInfo.projectName}
                  tokenName={projectInfo.token.tokenName}
                  tokenCurrency={projectInfo.tokenCurrency}
                  creationDate={projectInfo.createdAt}
                  availableAmount={availableTokenAmount}
                  tokenPriceCOP={projectInfo.tokenPrice}
                  tokenPriceADA={projectInfo.token.oraclePrice}
                  tokenImageUrl={tokenImageUrl}
                />
                <div>
                  <span>Cantidad de tokens:</span>
                  <TextInput
                    className="mt-2"
                    addon={
                      <BlockChainIcon className="h-5 w-5"></BlockChainIcon>
                    }
                    color={validationError && 'failure'}
                    helperText={validationError && validationError}
                    type="number"
                    onChange={(e) => {
                      handleSetTokenAmount(e.target.value);
                    }}
                    value={tokenAmount}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    className="flex justify-center w-full text-amber-400 bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded px-5 py-2.5"
                    onClick={handleCreateTransactionStep}
                  >
                    Pago Crypto
                  </button>
                  <button
                    className="flex justify-center w-full text-amber-400 bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded px-5 py-2.5"
                    onClick={() => handlePayment()}
                  >
                    Pago FIAT
                  </button>
                </div>
                {showCheckout && (
                  <EpaycoCheckout
                    amount={projectInfo.tokenPrice}
                    currency={projectInfo.tokenCurrency}
                    tokenQuantity={tokenAmount}
                    tokenName={projectInfo.token.tokenName}
                    invoiceID={invoiceID}
                  ></EpaycoCheckout>
                )}
              </div>
            )}
            {/* Pago Billetera Exterior */}
            {purchaseStep === PURCHASE_STEPS.PAYING && (
              <div className="flex flex-col items-center justify-center space-y-4 h-64 bg-custom-dark text-amber-400 rounded-lg p-6">
                {payingStep === PAYING_STEPS.PROCESSING && (
                  <>
                    <LoadingIcon className="h-10 w-10"></LoadingIcon>
                    <span>{transactionStatusMessage}</span>
                    {txHash && (
                      <div className="bg-custom-fondo text-black p-6">
                        <div>
                          <span className="font-bold">
                            Hash de la transacción:{' '}
                          </span>
                          <Link
                            className=""
                            href={`${cardanoscan}${txHash}`}
                            target="_blank"
                          >
                            <span className="underline">
                              {txHashLink(txHash)}
                            </span>
                          </Link>
                        </div>
                        <div>
                          <span className="font-bold">
                            Tokens por recibir:{' '}
                          </span>
                          <span>
                            {tokenAmount} ({projectInfo.token.tokenName})
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {payingStep === PAYING_STEPS.FINISHED && (
                  <>
                    <p className="font-medium">Transaccion Finalizada</p>
                    <div className="bg-custom-fondo text-black p-6">
                      <div>
                        <span className="font-bold">
                          Hash de la transacción:{' '}
                        </span>
                        <Link
                          className=""
                          href={`${cardanoscan}${txHash}`}
                          target="_blank"
                        >
                          <span className="underline">
                            {txHashLink(txHash)}
                          </span>
                        </Link>
                      </div>
                      <div>
                        <span className="font-bold">Tokens Recibidos: </span>
                        <span>
                          {tokenAmount} ({projectInfo.token.tokenName})
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between gap-x-2">
                      {/* <Link href={'/dashboard'}>
                        <Button color="success">Ver mis Tokens</Button>
                      </Link>
                      <Button onClick={resetSteps}>Volver a comprar</Button> */}
                      <Link href={'/dashboard'}>
                        <button className="bg-amber-400 text-black hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-sm rounded px-5 py-2">
                          Ver mis Tokens
                        </button>
                      </Link>
                      <button
                        className="bg-amber-400 text-black hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-sm rounded px-5 py-2"
                        onClick={resetSteps}
                      >
                        Volver a comprar
                      </button>
                    </div>
                  </>
                )}
                {payingStep === PAYING_STEPS.ERROR && (
                  <>
                    <p className="font-medium">Parece que hubo algun error</p>
                    <button
                      className="bg-amber-400 text-black hover:bg-amber-500 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-sm rounded px-5 py-2"
                      onClick={resetSteps}
                    >
                      Volver a intentar
                    </button>
                  </>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
        {/* <BuyTokenCard
        tokenAmount={tokenAmount}
        handleSetTokenAmount={handleSetTokenAmount}
        validationError={validationError}
      ></BuyTokenCard>
      <BillingCard
        tokenAmount={tokenAmount}
        setValidationError={setValidationError}
      ></BillingCard> */}
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="buyTokens"
        isCollapsed={false}
      />
    </>
  );
}