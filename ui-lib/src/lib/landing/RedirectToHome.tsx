import { useState, useContext } from 'react';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { WalletContext } from '@marketplaces/utils-2';
import Image from 'next/image';
import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
/* import { useAssets } from '@meshsdk/react' */
import { event }from '../common/event';
import { toast } from 'sonner';
interface RedirectToHomeProps {
  poweredby: boolean;
  image: string;
  width_image: number;
  appName: string;
  checkingWallet: string
  walletData: any
  handleSetCheckingWallet: (data : string) => void
}
const optionsToDisplay : any = {
  hasTokenAuth:{
    title: 'Token de autorización encontrado',
    paragraph: 'Redirigiendo al marketplace...',
  },
  requestToken:{
  // Ruta de la imagen
    title: 'Último paso, solicitar tu token de acceso',
    paragraph: 'Para acceder al Marketplace, necesitas solicitar primero tu token de acceso. Una vez recibido y disponible en tu billetera, podrás ingresar al Marketplace. Ten en cuenta que puede llevar algún tiempo hasta que el token esté listo en tu billetera. Por favor, espera mientras verificamos la recepción del token.',
  },
  alreadyClaimToken:{
    title: 'Ya enviamos el token de acceso a tu billetera'/* 'Ya solicitaste tu token de acceso' */,
    paragraph: 'Con este token podrás acceder al marketplace y comenzar a operar. Por favor, espera mientras validamos la transacción.',
  }
}
const RedirectToHome = (props: RedirectToHomeProps) => {
  const {
    walletID,
  } = useContext<any>(WalletContext);
  const { poweredby, appName, checkingWallet, walletData , handleSetCheckingWallet, image, width_image} = props;
  const [loading, setLoading] = useState<boolean>(false)
  const [statusText, setStatusText] = useState<string>('Validando token en billetera')
  const [showButtonAccess, setShowButtonAccess] = useState<boolean>(false)
  const [claimed, setClaimed] = useState<boolean>(false)
  const [tryAgainAccessToken, setTryAgainAccessToken] = useState<boolean>(false)
  
 /*  const assets = useAssets() as Array<{ [key: string]: any }>
   */
  const router = useRouter();

  const checkTokenStakeAddress = async (rewardAddresses: any) => {
    const response = await fetch('/api/calls/backend/checkTokenStakeAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rewardAddresses),
    });
    const hasTokenStakeAddress = await response.json();
    console.log(hasTokenStakeAddress, 'checkTokenStakeAddress')
    return hasTokenStakeAddress;
  };

  useEffect(() => {
    let tokenFound = false;
    if (checkingWallet === 'hasTokenAuth') {
      router.push('/home');
    }
    const interval = setInterval(async () => {
      if (!tokenFound && checkingWallet === 'alreadyClaimToken') {
        setLoading(true);
        try {
          //const balanceData = await getWalletBalanceByAddress(walletData.address);
          const hasTokenAuthFunction = await checkTokenStakeAddress(
            walletData.address
          );
          console.log(hasTokenAuthFunction, 'hasTokenAuthFunction');
          /* const hasTokenAuth = balanceData.assets.some((asset: any) => asset.policy_id === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER &&
              asset.asset_name === process.env.NEXT_PUBLIC_TOKEN_AUTHORIZER_NAME); */
          if (hasTokenAuthFunction) {
            setLoading(false);
            setStatusText('Token encontrado, redirigiendo...');
            setShowButtonAccess(true);
            tokenFound = true;
          } else {
            setStatusText('Token no encontrado, por favor espera...');
          }
        } catch (error) {
          console.error('Error al obtener el saldo de la billetera:', error);
          setLoading(false);
        }
      }
    }, 20000);
  
    return () => clearInterval(interval);
  }, [checkingWallet]);

  useEffect(() => {
    let timer: any
    if (claimed) {
      timer = setInterval(() => {
        setTryAgainAccessToken(true);
      }, 180000);
    }
    return () => clearInterval(timer);
  }, [claimed]);
  
  const getWalletBalanceByAddress = async (address: any) =>{
    const balanceFetchResponse = await fetch('/api/calls/backend/getWalletBalanceByAddress', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
  })

  const balanceData = await balanceFetchResponse.json()
  return balanceData
  }

  const requestToken = async () => {
      if (walletData) {
        let payload = walletData.address;
        let attempts = 0;
        const maxAttempts = 6;
        const retryInterval = 30000;
        const tryRequest = async () => {
          try {
            const response = await fetch(`api/helpers/requestAccessToken?destinAddress=${payload}&walletID=${walletData.id}`, {
              method: 'GET',
            });
    
            const data = await response.json(); /* {detail: 'error'} */
    
            if (!data.detail) {
              const response2 = await fetch('api/calls/backend/walletClaimToken', {
                method: 'POST',
                body: JSON.stringify({
                  id: walletData.id,
                }),
              });
    
              const data2 = await response2.json();
              const user = await getCurrentUser();
    
              // analytics
              event({
                action: 'claim_access_token',
                category: 'marketplace',
                label: 'User claim access token',
                value: user.username,
              });
    
              setClaimed(true);
              handleSetCheckingWallet('alreadyClaimToken');
              setLoading(false);
              return;
            } else {
              throw new Error('Request failed with detail in response');
            }
          } catch (error) {
            console.error('Error al hacer la solicitud:', error);
            attempts++;
            if (attempts < maxAttempts) {
              toast.info('Reintentando envío de token...')
              setTimeout(tryRequest, retryInterval);
            } else {
              toast.warning('Error al intentar enviar el token. Reintente más tarde.')
              setLoading(false);
            }
          }
        };
    
        setLoading(true);
        tryRequest();
      }
    }
   /*  const retryAccessToken = async () => {
      setTryAgainAccessToken(false)

      if (walletData) {
        let payload = walletData.address;
        try {
            setLoading(true)
            const response = await fetch(`api/helpers/requestAccessToken?destinAddress=${payload}`, {
              method: 'GET',
            });
            toast.success('Solicitud de token enviada nuevamente.')

          } catch (error) {
            toast.warning('Error al intentar enviar el token. Reintente más tarde.')
            setLoading(false)
          }
          setLoading(false)
    }
  } */
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
      fuenteVariante: string;
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
  };

    return (
    <div className="bg-white rounded-2xl w-[40rem] max-w-[35rem] 2xl:w-[45%] py-10 px-10 sm:px-10 h-auto flex flex-col justify-center">
        <div className='flex justify-center mb-8'>
        <Image
          src={image}
          width={width_image}
          height={80}
          alt="Logotipo de Terrasacha"
        />
      </div>
      <h2 className={`${colors.fuente}  text-2xl font-normal pb-4 flex justify-center text-center`}>
       {optionsToDisplay[checkingWallet]?.title}
      </h2>
      <p className="text-sm text-gray-500 text-center mb-2">
      {optionsToDisplay[checkingWallet]?.paragraph}
      </p>
      <div className='h-8 w-full mb-6'>
      {checkingWallet === 'alreadyClaimToken' && loading &&
      <div className="w-full flex text-md gap-2 items-center justify-center">
        <TailSpin width="10" color="#0e7490" wrapperClass="" />
        <p className='text-sm text-gray-500'>{statusText}</p>
      </div>
      }
      {/* {tryAgainAccessToken &&
        <button onClick={() => retryAccessToken()} className="relative w-full h-10 flex items-center justify-center font-normal focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2">
            Reintentar envío
      </button>
      } */}
      {showButtonAccess &&
          <button onClick={() =>router.push('/home')} className="w-full group flex h-min items-center justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent focus:ring-cyan-300 dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700 dark:focus:ring-cyan-800 rounded-lg focus:ring-2 px-8 ml-4">
            Acceder
          </button>
      }
      </div>
      {checkingWallet === 'hasTokenAuth' &&
        <div className="flex text-xs gap-4 items-center justify-center  mb-4">
          <TailSpin width="30" color="#0e7490" wrapperClass="" />
        </div>
        }
    {checkingWallet === 'requestToken' &&  
  <button 
    onClick={() => requestToken()} 
    disabled={claimed} 
    className="relative group flex h-10 w-full items-center justify-center p-2 text-center font-medium focus:z-10 focus:outline-none text-white bg-black hover:bg-black border border-transparent rounded-lg focus:ring-2 px-8 mt-4 mb-4"
  >
    {loading ? (
      <TailSpin
        width="20"
        color="#fff"
        wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    ) : (
      'Solicitar token'
    )}
  </button>
}

{checkingWallet !== 'hasTokenAuth' && 
  <button 
    className="relative group flex h-10 w-full items-center justify-center p-2 text-center font-medium focus:z-10 focus:outline-none text-white bg-black hover:bg-black border border-transparent rounded-lg focus:ring-2 px-8 mt-4 mb-4"
    onClick={() => {
      signOut().then(() => router.reload());
    }}
  >
    Cerrar sesión
  </button>
}

      {poweredby && (
        <div className="flex items-center justify-center mt-4 text-xs">
          Powered by
          <Image
            src="/images/home-page/suan_logo.png"
            height={10}
            width={12}
            className="ml-2"
            alt={`${appName} logo`}
          />
        </div>
      )}
    </div>
  );
};

export default RedirectToHome;
