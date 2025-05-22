import { useContext, useRef, useState } from 'react';
import { LoadingIcon } from '../../icons/LoadingIcon';
import { LockIcon } from '../../icons/LockIcon';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { eventTransactionCrypto } from '../../common/event';
import { EyeIcon, EyeOffIcon } from '../../ui-lib';
interface SignTransactionProps {
  handleOpenSignTransactionModal: (signStatus?: boolean) => void;
  pendingTx: any;
  signType: string;
}

export default function SignTransaction(props: SignTransactionProps) {
  const { handleOpenSignTransactionModal, pendingTx, signType } = props;
  const { walletID, walletAddress } = useContext<any>(WalletContext);

  const [password, setPassword] = useState<any>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRouteChanging = useRef(false);

  const router = useRouter();
  const handleRouteChangeStart = () => {
    isRouteChanging.current = true;
  };
  
  router.events.on('routeChangeStart', handleRouteChangeStart);

  const validateWalletPassword = async () => {
    const response = await fetch('/api/calls/backend/validateWalletPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, wallet_id: walletID }),
    });
    const passwordValidation = await response.json();

    return passwordValidation.isValidUser;
  };

  const handleSignTransactionDistributeTokens = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
      transaction_id: pendingTx.transaction_id
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);
    if (signSubmitResponse?.txSubmit?.success) {
      // Actualizar un campo en tabla dynamo que indique que los tokens del proyecto han sido reclamados por el propietario o no
      // Actualizar campo token genesis
      try {
        const [updateProductResponse, createTokenResponse] = await Promise.all([
          fetch('/api/calls/backend/updateProduct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              pendingTx.postDistributionPayload.updateProduct
            ),
          }),
          fetch('/api/calls/backend/createToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTx.postDistributionPayload.createToken),
          }),
          // fetch('/api/transactions/oracle-datum', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify(
          //     pendingTx.postDistributionPayload.createOracleDatum
          //   ),
          // }),
        ]);

        const productUpdatedResponse = await updateProductResponse.json();
        const createTokenResponseData = await createTokenResponse.json();
        // const createOracleDatumResponseData = await createOracleDatumResponse.json();

        console.log('Actualización del producto:', productUpdatedResponse);
        console.log('Creación del token:', createTokenResponseData);
        // console.log(
        //   'Creación precio en oraculo:',
        //   createOracleDatumResponseData
        // );
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSignTransactionBuyTokens = async (tx: any = null) => {
    let txToSign = null;
    if (tx) {
      txToSign = tx;
    } else {
      txToSign = pendingTx;
    }
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: txToSign.cbor,
      scriptIds: [txToSign.scriptId],
      metadata_cbor: txToSign.metadata_cbor,
      redeemers_cbor: [txToSign.redeemer_cbor],
      transaction_id: pendingTx.transaction_id
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    return signSubmitResponse;
  };

  const handleSignTransactionSendTransaction = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [],
      transaction_id: pendingTx.transaction_id
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);
    return signSubmitResponse;
  };

  const handleSignTransactionCreateOrder = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [],
      transaction_id: pendingTx.transaction_id
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse?.txSubmit?.success) {
      // Actualizar un campo en tabla dynamo que indique que los tokens del proyecto han sido reclamados por el propietario o no
      // Actualizar campo token genesis
      try {
        const [createOrderResponse] = await Promise.all([
          fetch('/api/calls/createOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTx.postDistributionPayload.createOrder),
          }),
        ]);

        const createOrderResponseData = await createOrderResponse.json();

        console.log('Creación de la orden:', createOrderResponseData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSignTransactionUnlockOrder = async () => {
    const confirmSubmitData = {
      wallet_id: walletID,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
      transaction_id: pendingTx.transaction_id
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse?.txSubmit?.success) {
      try {
        const [updateOrderResponse] = await Promise.all([
          fetch('/api/calls/updateOrder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTx.postDistributionPayload.updateOrder),
          }),
        ]);

        const updateOrderResponseData = await updateOrderResponse.json();

        console.log('Actualizacion de la orden:', updateOrderResponseData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const handleSignTransactionUnlockOrderPayment = async () => {
    const confirmSubmitData = {
      wallet_id: pendingTx.walletId,
      cbor: pendingTx.cbor,
      scriptIds: [pendingTx.scriptId],
      metadata_cbor: pendingTx.metadata_cbor,
      redeemers_cbor: [pendingTx.redeemer_cbor],
    };
    const response = await fetch('/api/transactions/sign-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(confirmSubmitData),
    });
    const signSubmitResponse = await response.json();
    console.log('Firmado de transacción: ', signSubmitResponse);

    if (signSubmitResponse?.txSubmit?.success) {
      try {
        const [updatePaymentResponse] = await Promise.all([
          fetch('/api/calls/backend/updatePaymentClaimedStatus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              pendingTx.postDistributionPayload.updatePayment
            ),
          }),
        ]);

        const updatePaymentResponseData = await updatePaymentResponse.json();

        console.log('Actualizacion de el pago:', updatePaymentResponseData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    return signSubmitResponse;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSign = async () => {
    setIsLoading(true);

    const isValidUser = await validateWalletPassword();

    if (!isValidUser) {
      setPasswordError(true);
      setIsLoading(false);
      return;
    }

    let signSubmitResponse;
    let data;
    console.log('pendingTx', pendingTx);

    if (signType === 'distributeTokens') {
      signSubmitResponse = await handleSignTransactionDistributeTokens();
    }

    if (signType === 'buyTokens') {
      data = pendingTx.postDistributionPayload; // Esta variable contiene la info almacenada en  --> PaymentPage:609 || Gracias bro. Sign: 🧙‍♂️
      signSubmitResponse = await handleSignTransactionBuyTokens();
    }

    if (signType === 'sendTransaction') {
      signSubmitResponse = await handleSignTransactionSendTransaction();
    }

    if (signType === 'createOrder') {
      signSubmitResponse = await handleSignTransactionCreateOrder();
    }

    if (signType === 'unlockOrder') {
      signSubmitResponse = await handleSignTransactionUnlockOrder();
    }

    if (signType === 'unlockOrderPayment') {
      signSubmitResponse = await handleSignTransactionUnlockOrderPayment();
    }

    // Crear transacción

    if (signSubmitResponse?.txSubmit?.success) {
      //analytics

      if (signType === 'buyTokens') {
        eventTransactionCrypto({
          action: 'buy_token',
          category: 'marketplace',
          label: `Token from project ${data.projectName} purchased`,
          token: data.tokenName,
          amount: data.tokenAmount,
        });
      }
      handleOpenSignTransactionModal(true);
      toast.success('Seras redirigido en unos instantes...');
      localStorage.setItem(
        'pendingTx',
        JSON.stringify({ data: pendingTx, timestamp: Date.now() })
      );

      setTimeout(() => {
        router.push({
          pathname: '/wallet/transactions',
        });
      }, 3000);
    } else {
      if (signType === 'buyTokens') {
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
              body: JSON.stringify(pendingTx.retryPayload),
            });
            const buildTxResponse = await request.json();
            console.log('BuildTx Response: ', buildTxResponse);

            if (buildTxResponse?.success) {
              const mappedTransactionData = await mapBuildTransactionInfo({
                tx_type: 'preview',
                walletAddress: walletAddress,
                buildTxResponse: buildTxResponse,
                metadata: {},
              });

              const txData = {
                ...mappedTransactionData,
                scriptId: pendingTx.scriptId,
              };

              const newSignSubmitResponse =
                await handleSignTransactionBuyTokens(txData);

              if (newSignSubmitResponse?.txSubmit?.success) {
                eventTransactionCrypto({
                  action: 'buy_token',
                  category: 'marketplace',
                  label: `Token from project ${data.projectName} purchased`,
                  token: data.tokenName,
                  amount: data.tokenAmount,
                });

                handleOpenSignTransactionModal(true);
                toast.success('Seras redirigido en unos instantes...');
                // localStorage.setItem('pendingTx', JSON.stringify(pendingTx));
                localStorage.setItem(
                  'pendingTx',
                  JSON.stringify({ data: pendingTx, timestamp: Date.now() })
                );

                setTimeout(() => {
                  router.push({
                    pathname: '/wallet/transactions',
                  });
                }, 3000);

                break;
              } else {
                toast.error('Reintentando ...');
                throw new Error('Build transaction failed');
              }
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
            } else {
              toast.error(
                'Algo ha salido mal, revisa las direcciones de billetera ...'
              );
            }
          }
        }
      }
      toast.error('Ha ocurrido un error al intentar realizar la transacción');
    }

    setIsLoading(false);
  };
  const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente:'font-jostBold',
      fuenteAlterna:'font-jostRegular',
    },
  
    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor:  'bg-custom-dark' ,
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente:'font-semibold',
    fuenteAlterna:'font-medium',
  };
  return (
    <div className="space-y-4">
      <div className="flex-col">
        <p className={`${colors.fuente} `}>Confirmar</p>
        <p className={`${colors.fuenteAlterna} `} >
          Revise la transacción antes de firmar. Ingrese la contraseña de su
          billetera.
        </p>
      </div>
      <hr />
      <div className="flex-col">
        <p className={`${colors.fuente} `}>Firmar</p>
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3 pointer-events-none">
            <LockIcon className={`${colors.fuente} w-5 h-5 `}  />
          </div>
          <input
            type={showPassword ? "text" : "password"} 
            aria-invalid="false"
            className={`${colors.fuenteAlterna} bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 ${
              passwordError &&
              'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
            }`}
            autoComplete="off"
            placeholder="Ingresa la contraseña de tu wallet"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div 
      className="absolute inset-y-0 end-0 top-0 flex items-center pe-3 cursor-pointer"
      onClick={togglePasswordVisibility}
    >
      {showPassword ? (
        <EyeOffIcon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
      ) : (
        <EyeIcon className="w-5 h-5 text-gray-600 hover:text-gray-800" />
      )}
    </div>
  </div>

  {/* Mensaje de error */}
  {passwordError && (
    <p className={`${colors.fuente} text-red-500 text-xs mt-1`}>
      Contraseña incorrecta
    </p>
  )}
      </div>
      <hr />
      <div className={`${colors.fuente} flex flex-col md:flex-row justify-between space-y-2 md:space-y-0`}>
        <button
          type="button"
          className={`flex justify-center w-full md:w-1/4 text-white  ${colors.bgColor}  ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5  `}
          onClick={() => handleOpenSignTransactionModal()}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`flex justify-center w-full md:w-1/4 text-white ${colors.bgColor}  ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm px-5 py-2.5 `}
          onClick={handleSign}
        >
          {isLoading ? <LoadingIcon className="w-4 h-4" /> : 'Firmar'}
        </button>
      </div>
      <hr />
    </div>
  );
}
