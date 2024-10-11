import React, { useContext, useState, useEffect } from 'react';
import Projects from './scripts/Projects';
import Scripts from './scripts/Scripts';
import Card from '../common/Card';
import SignTransactionModal from '../wallet/sign-transaction/SignTransactionModal';
import { WalletContext, mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { toast } from 'sonner';
import { LoadingIcon } from '../ui-lib';
import { WarningIcon } from '../icons/WarningIcon'
import { InfoIcon } from '../icons/InfoIcon';
import { TailSpin } from 'react-loader-spinner';
import { TrophyIcon } from '../icons/TrophyIcon';
import { getScriptTokenAccess } from '@marketplaces/data-access'
export default function CoreWallet(props: any) {
  const { walletID, walletAddress, walletData } =
    useContext<any>(WalletContext);
  const [oracleWalletLovelaceBalance, setOracleWalletLovelaceBalance] =
    useState<number | null>(null);
  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>({
    transfer: false,
    query: false,
  });
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [adaToSend, setAdaToSend] = useState<string>('');
  const [loadingSendTokenAccess ,setLoadingSendTokenAccess] = useState(false)
  const [sendTokenAcces, setSendTokenAccess] = useState(false)
  const [hasTokenAcces, setHasTokenAccess] = useState(false)

  useEffect(() =>{
    if(!hasTokenAcces && walletData){
      const hasAsset = walletData.assets.some((asset : any) => asset.asset_name === 'SandboxSuanAccess1')

      if(hasAsset){
        setSendTokenAccess(false)
        setHasTokenAccess(true)
      }
    }
  },[walletData])

  const getWalletBalanceByAddress = async (address: any) => {
    const balanceFetchResponse = await fetch(
      '/api/calls/backend/getWalletBalanceByAddress',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      }
    );

    const balanceData = await balanceFetchResponse.json();
    return balanceData.balance;
  };

  const configureMarketplace = async () => {
    setLoadingSendTokenAccess(true)
    
    const payload = {
      walletID: walletID,
      walletAddress: walletAddress
    }
    
    try {
      const request = await fetch('/api/marketplace/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const response = await request.json();
      if(response) {
        setSendTokenAccess(true)
      }

      console.log('Respuesta de configuración de marketplace: ', response)
    } catch (error) {
      console.log(`Error configurando marketplace ${error}`)
    } finally {
      setLoadingSendTokenAccess(false)

    }
  }

  const generateTokenAccess = async () =>{
    const url = `${process.env.NEXT_PUBLIC_TRAZABILIDAD_ENDPOINT}/api/v1/helpers/send-access-token/?wallet_id=${walletID}&destinAddress=${walletAddress}&marketplace_id=${process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLocaleLowerCase()}&save_flag=true`
    setLoadingSendTokenAccess(true)
    try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY_ENDPOINT || ''
          },
      });
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('data received', data);
      setSendTokenAccess(true)
      return data;
  } catch (error) {
      console.error('Error fetching token access:', error);
      throw error; 
  } finally {
    setLoadingSendTokenAccess(false)
  }
  }

  const handleGetOracleWalletLovelaceBalance = async () => {
    setIsLoading((prevState: any) => ({
      ...prevState,
      query: true,
    }));
    const lovelaceAmount = await getWalletBalanceByAddress(
      'addr_test1vrvyzwdky7hf7rqsnc3v69lr604tprdp3uyvkc0wqmrwmgqsgss8y'
    );

    setOracleWalletLovelaceBalance(lovelaceAmount);

    setIsLoading((prevState: any) => ({
      ...prevState,
      query: false,
    }));
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const handleSendTransaction = async () => {
    setIsLoading((prevState: any) => ({
      ...prevState,
      transfer: true,
    }));

    if (parseFloat(adaToSend) <= 0) {
      toast.error(
        'Debes agregar una cantidad de ADAs valida para poder enviar.'
      );
      return;
    }

    const payload = {
      payload: {
        wallet_id: walletID,
        addresses: [
          {
            address:
              'addr_test1vrvyzwdky7hf7rqsnc3v69lr604tprdp3uyvkc0wqmrwmgqsgss8y', // Remplazar por billetera oraculo del marketplace
            lovelace: parseFloat(adaToSend) * 1000000,
            multiAsset: [],
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletID,
        walletAddress: walletAddress,
      },
    };
    if (walletData) {
      console.log('BuildTx Payload: ', payload);

      const request = await fetch('/api/transactions/build-tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const buildTxResponse = await request.json();
      console.log('BuildTx Response: ', buildTxResponse);

      if (buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletData.address,
          buildTxResponse: buildTxResponse,
          metadata: {},
        });

        setNewTransactionBuild({
          ...mappedTransactionData,
          transaction_id: buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal();
      } else {
        toast.error(
          <span className={colors.fuente}>Algo ha salido mal, revisa las direcciones de billetera ..</span>
        );
      }
    }
    setIsLoading((prevState: any) => ({
      ...prevState,
      transfer: false,
    }));
  };
  const marketplaceName =
  process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
const marketplaceColors: Record<
  string,
  {
    bgColor: string;
    hoverBgColor: string;
    bgColorAlternativo: string;
    fuente: string;
    fuenteAlterna: string;
    fuenteVariante:string;
  }
> = {
  Terrasacha: {
    bgColor: 'bg-custom-marca-boton',
    hoverBgColor: 'hover:bg-custom-marca-boton-variante',
    bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
    fuente: 'font-jostBold',
    fuenteAlterna: 'font-jostRegular',
    fuenteVariante: 'font-jostItalic',
  },

  // Agrega más marketplaces y colores aquí
};
const colors = marketplaceColors[marketplaceName] || {
  bgColor: 'bg-custom-dark',
  hoverBgColor: 'hover:bg-custom-dark-hover',
  bgColorAlternativo: 'bg-amber-400',
  fuente: 'font-semibold',
  fuenteAlterna: 'font-medium',
  fuenteVariante: 'font-normal',
};

  if(!walletData) return null
  return (
    <>
    {sendTokenAcces? 
    <div className="grid grid-cols-2">
    <div
      id="alert-additional-content-3"
      className="col-span-2 p-4 mb-5 space-y-4 text-gray-600 border border-gray-200 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
      role="alert"
    >
      <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-medium flex gap-x-2 items-center">
            <InfoIcon /> Aguarda mientras verificamos el token de acceso
          </h3>
      </div>
    </div>
  </div>
    :
    hasTokenAcces ? <div className="grid grid-cols-2">
          <div
            id="alert-additional-content-3"
            className="col-span-2 p-4 mb-5 space-y-4 text-green-600 border border-green-200 rounded-lg bg-green-100 dark:bg-gray-700 dark:text-green-300 dark:border-green-700"
            role="alert"
          >
            <div className="flex flex-col space-y-4">
                <h3 className={`${colors.fuente} text-lg font-medium flex gap-x-2 items-center`}>
                  <TrophyIcon /> Tu marketplace está configurado correctamente
                </h3>
            </div>
          </div>
        </div>
        :
        walletData.balance !== "0"?
          <div
            id="alert-additional-content-3"
            className={`${colors.fuenteAlterna}  col-span-2 p-4 mb-5 space-y-4 text-blue-700 border border-blue-200 rounded-lg bg-blue-50 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-700`}
            role="alert"
          >
            <div className="flex flex-col space-y-4">
              <div className="space-y-4">
                <h3 className={`${colors.fuente}   text-lg font-medium flex gap-x-2 items-center`}>
                  <WarningIcon /> Creación del token de acceso
                </h3>
                <div className="text-md">
                  Este paso es indispensable para que los usuarios puedan ingresar
                  y operar dentro de la aplicación
                </div>
               
                <button 
                onClick={() => configureMarketplace()} disabled={loadingSendTokenAccess} className={`text-white ${colors.fuente} ${colors.bgColor} ${colors.hoverBgColor} relative py-2 px-6 rounded-md  text-sm hover:bg-blue-400  min-h-10 min-w-40`}>
                {loadingSendTokenAccess ? (
                    <TailSpin
                      width="20"
                      color="blue"
                      wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                  ) : (
                    'Enviar token de acceso'
                  )}
                  </button>
              
              </div>
            </div>
          </div>
          :
          <div
            id="alert-additional-content-3"
            className="col-span-2 p-4 mb-5 space-y-4 text-amber-800 border border-amber-300 rounded-lg bg-amber-50 dark:bg-gray-800 dark:text-amber-400 dark:border-amber-800"
            role="alert"
          >
            <div className="flex flex-col space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex gap-x-2 items-center">
                  < InfoIcon/> Envia fondos a tu billetera para finalizar la configuración del marketplace 
                </h3>
                <div className="text-md">
                  Con esto tendrás fondos para poder generar el token de acceso a tu marketplace
                </div>
              </div>
            </div>
          </div>
      }
      <div className={`${colors.fuente} grid grid-cols-2`}>
        <div className={`${colors.fuenteAlterna} col-span-2`}>
          <Card>
            <Card.Header title="Billetera Oráculo" />
            <Card.Body>
              <div className="flex flex-col space-y-2">
                <div>
                  <label className="block mb-2 text-gray-900">
                    Consulta de saldo
                  </label>
                  <div className="flex space-x-2 items-center">
                    <button
                      type="button"
                      className={`${colors.fuente} text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 `}
                      onClick={handleGetOracleWalletLovelaceBalance}
                    >
                      {isLoading.query ? (
                        <LoadingIcon className="w-5 h-5" />
                      ) : (
                        'Consultar'
                      )}
                    </button>
                    <label
                      className={`${
                        !oracleWalletLovelaceBalance && 'hidden'
                      } text-gray-900`}
                    >
                      El saldo de la billetera Oraculo es de{' '}
                      {oracleWalletLovelaceBalance &&
                        oracleWalletLovelaceBalance / 1000000}{' '}
                      ADAs
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block mb-2 text-gray-900">
                      Recarga de ADAs a billetera Oraculo
                    </label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                        t₳
                      </div>
                      <input
                        id="adas"
                        type="text"
                        aria-invalid="false"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
                        autoComplete="off"
                        placeholder="0.000000"
                        value={adaToSend}
                        onChange={(e) => setAdaToSend(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={` ${colors.fuente}  text-white ${colors.bgColor} ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 `}
                    onClick={handleSendTransaction}
                  >
                    {isLoading.transfer ? (
                      <LoadingIcon className="w-5 h-5" />
                    ) : (
                      'Transferir'
                    )}
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-span-2">
          <Projects />
        </div>
        <div className="col-span-2">
          <Scripts />
        </div>
      </div>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="sendTransaction"
      />
    </>
  );
}
