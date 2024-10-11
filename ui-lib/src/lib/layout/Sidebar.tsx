/* import { useWallet } from '@meshsdk/react'; */
import { useEffect, useState, useRef, useContext } from 'react';
import Image from 'next/image';
import { Tooltip } from 'react-tooltip';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookIcon } from '../icons/BookIcon';
import { ChartIcon } from '../icons/ChartIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { MarketIcon } from '../icons/MarketIcon';
import { ScaleIcon } from '../icons/ScaleIcon';
import WalletIcon from '../icons/WalletIcon';
import { WalletContext } from '@marketplaces/utils-2';
import { InfoIcon, LoadingIcon, SquareArrowUpIcon } from '../ui-lib';
import SideBarBalanceSkeleton from '../common/skeleton/SideBarBalanceSkeleton';
import { fetchUserAttributes } from 'aws-amplify/auth';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  user: any;
  image: string;
  widthLogo: number;
  heightLogo: number;
  poweredBy: boolean;
  balance: any;
  balanceUSD: any
}

const getRates = async () => {
  const response = await fetch('/api/calls/getRates')
  const data = await response.json()
  let dataFormatted: any = {}
  data.map((item: any) => {
      let obj = `ADArate${item.currency}`
      dataFormatted[obj] = parseFloat(item.value.toFixed(4))
  });
  return dataFormatted
}

export default function Sidebar(props: SidebarProps) {
  const {
    isOpen,
    onClose,
    appName,
    image,
    widthLogo,
    heightLogo,
    poweredBy,
    balance,
    balanceUSD
  } = props;
  const { walletAdmin, isLoading, lastSyncDate, balanceChanged, walletAvailableBalance, walletLockedBalance } =
    useContext<any>(WalletContext);
  const router = useRouter();
  /* const { wallet, connected } = useWallet(); */
  const [walletStakeID, setWalletStakeID] = useState<any>(undefined);
  const [copied, setCopied] = useState(false);
  const [allowAccessCW, setAllowAccessCW] = useState(false)
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [displayWalletOptions, setDisplayWalletOptions] = useState(false);
  const [displayMarketOptions, setDisplayMarketOptions] = useState(false);
  const [syncedAgo, setSyncedAgo] = useState<number>(0);
  const [balanceChangeUSD, setBalanceChangeUSD] = useState<number>(0)
  const [changeOnBalanceDetected, setChangeOnBalanceDetected] =
    useState<boolean>(false);
  const [env, setEnv] = useState('')
  useEffect(() =>{
    const env = process.env.NEXT_PUBLIC_ENV || ''
    setEnv(env)
    fetchUserAttributes().then((data :any)=>{
      if(data['custom:role'] === 'marketplace_admin' && data['custom:subrole'] === process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLocaleLowerCase()){
        setAllowAccessCW(true)
      }
    })
  },[])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (sidebarRef.current &&
          !sidebarRef.current.contains(event.target as Node)) ||
        (event.target instanceof HTMLAnchorElement &&
          event.target.closest('aside#logo-sidebar'))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  /* useEffect(() => {
    if (connected) {
      loadUserData();
    } else {
      resetComponentState();
    }
  }, [connected]); */

  useEffect(() => {
    const playCashRegister = () => {
      var audio: any = document.getElementById('a1');
      audio.play();
    };

    if (balanceChanged !== 0) {
      getRates()
    .then(rates =>{
      //@ts-ignore
      setBalanceChangeUSD(Math.abs(((balanceChanged / 1000000) * rates.ADArateUSD).toFixed(4)))
      playCashRegister();
      setChangeOnBalanceDetected(true);

      setTimeout(() => {
        setChangeOnBalanceDetected(false);
      }, 4000);
    })
    }
  }, [balanceChanged]);

  useEffect(() => {
    // Fecha almacenada (ejemplo: 1 de julio de 2024)

    const calcularTiempo = () => {
      const fechaActual = Date.now();
      const diferencia = Math.floor((fechaActual - lastSyncDate) / 1000);

      setSyncedAgo(diferencia);
    };

    // Calcular el tiempo inmediatamente y luego cada segundo
    calcularTiempo();
    const intervalo = setInterval(calcularTiempo, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalo);
  }, [lastSyncDate]);
 /*  async function loadUserData() {
    const addresses = await wallet.getRewardAddresses();
    setWalletStakeID(addresses[0]);
  }

  function resetComponentState() {
    setWalletStakeID(undefined);
  } */
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
    <aside
  ref={sidebarRef}
  id="logo-sidebar"
  className={`fixed top-0 left-0 z-50 w-80 h-screen transition-transform lg:translate-x-0 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } flex flex-col justify-between`}
>
  <audio id="a1" src="/sounds/cash-register.mp3"></audio>
  <div className="relative h-full px-5 pb-4 bg-custom-fondo shadow-[rgba(221,222,227,1)_1px_1px_4px_0px] flex flex-col justify-between overflow-y-auto"> 
    <div>
      <div className="flex items-center justify-center py-8">
        <Link href="/home">
          <Image src={image} height={heightLogo} width={widthLogo} alt={`${appName} Logo`} />
        </Link>
      </div>

      <div className="pt-4 border-t border-gray-200"></div>
      {balance ? (
        <div>
          <label className={`${colors.fuenteAlterna}  block text-sm font-semibold text-gray-400`}>Tu saldo</label>
          <div>
            <p
              className={`text-xl truncate font-semibold mb-[-.1rem] ${
                changeOnBalanceDetected
                  ? balanceChanged >= 0
                    ? 'balance-changed-positive'
                    : 'balance-changed-negative'
                  : 'text-black'
              }`}
            >
              {!isLoading ? balanceUSD.toFixed(4) : <LoadingIcon className="h-5 w-5" />}{' '}
              <span className={`${colors.fuenteAlterna}  font-bold text-gray-400 text-base`}>USD</span>
              {changeOnBalanceDetected && (
                <>
                  <span className="inline-block animate-bounce ml-2">
                    {'('}
                    {balanceChanged >= 0 ? '+ ' : '- '}
                    {balanceChangeUSD}
                    {')'}
                  </span>
                </>
              )}
            </p>
            <p
              className={`text-sm font-light truncate ${
                changeOnBalanceDetected
                  ? balanceChanged >= 0
                    ? 'balance-changed-positive'
                    : 'balance-changed-negative'
                  : 'text-black'
              }`}
            >
              <span>Total: </span>
              {!isLoading ? balance : <LoadingIcon className="h-5 w-5" />}{' '}
              <span className="text-gray-400 text-xs">ADA</span>
              {changeOnBalanceDetected && (
                <>
                  <span className="inline-block animate-bounce ml-2">
                    {'('}
                    {balanceChanged >= 0 ? '+ ' : '- '}
                    {Math.abs(balanceChanged / 1000000)}
                    {')'}
                  </span>
                </>
              )}
            </p>
            <p
              className={`text-sm font-light truncate ${
                changeOnBalanceDetected
                  ? balanceChanged >= 0
                    ? 'balance-changed-positive'
                    : 'balance-changed-negative'
                  : 'text-black'
              }`}
            >
              <div className='inline' data-tooltip-id="available-tooltip" data-tooltip-content={`Cantidad de ADAs disponibles`}>
                <InfoIcon className="h-4 w-4 inline mr-1" />
              </div>
              <Tooltip id="available-tooltip" />
              <span>Disponible: </span>
              {!isLoading ? (walletAvailableBalance / 1000000).toFixed(4) : <LoadingIcon className="h-5 w-5" />}{' '}
              <span className="text-gray-400 text-xs">ADA</span>
            </p>
            <p
              className={`text-sm font-light truncate ${
                changeOnBalanceDetected
                  ? balanceChanged >= 0
                    ? 'balance-changed-positive'
                    : 'balance-changed-negative'
                  : 'text-black'
              }`}
            >
              <div className='inline' style={{zIndex: 1000}} data-tooltip-id="blocked-tooltip" data-tooltip-content={`En Cardano, cualquier token debe ir asociado a una cantidad de ADAs. Esta cantidad es la que se encuentra bloqueada para la billetera.`}>
                <InfoIcon className="h-4 w-4 inline mr-1" />
              </div>
              <Tooltip id="blocked-tooltip" style={{zIndex: 1000}}/>
              <span>Bloqueado: </span>
              {!isLoading ? (walletLockedBalance / 1000000).toFixed(4) : <LoadingIcon className="h-5 w-5" />}{' '}
              <span className="text-gray-400 text-xs">ADA</span>
            </p>
            <label className={`${colors.fuenteAlterna}  block text-xs font-light text-gray-500 pt-2`}>
              Sincronizado hace {syncedAgo} segundos
            </label>
          </div>
        </div>
      ) : (
        <SideBarBalanceSkeleton />
      )}

      <div className="pt-4 mt-2 border-t border-gray-200"></div>
      <ul className="space-y-4">
        <li>
        <div data-tooltip-id="my-tooltip" data-tooltip-content={`Ambiente de desarrollo: ${env}`} className='relative py-1 px-12 bg-blue-400 rounded-sm text-white text-xs w-full text-center'>
          {env}
        </div>
        <Tooltip id="my-tooltip" />
        </li>
        <li className={allowAccessCW ? '' : 'hidden'}>
          <Link
            onClick={onClose}
            href="/corewallet"
            className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
          >
            <ChartIcon />
            <span className={`${colors.fuenteAlterna}  ml-3`}>CoreWallet</span>
          </Link>
        </li>
        <li /* className={connected ? 'hidden' : ''} */>
          <button
            className="flex w-full items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
            onClick={() => setDisplayWalletOptions(!displayWalletOptions)}
          >
            <WalletIcon />
            <span className={`${colors.fuenteAlterna}  flex-1 ms-3 text-left rtl:text-right whitespace-nowrap`}>Billetera</span>
            <ChevronDownIcon />
          </button>
          <ul
            id="dropdown-example"
            className={`${
              !displayWalletOptions && 'hidden'
            } py-2 space-y-2 animate-fade animate-ease-in-out animate-duration-[400ms]`}
          >
            <li>
              <Link
                href="/wallet"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear`}
              >
                Cuadro de mando
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/assets"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear`}
              >
                Activos
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/transactions"
                className={`${colors.fuenteAlterna}  flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear`}
              >
                Transacciones
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/send"
                className={`${colors.fuenteAlterna} flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear`}
              >
                Nueva transaccion
              </Link>
            </li>
            <li>
              <Link
                href="/wallet/achievements"
                className={`${colors.fuenteAlterna}  flex items-center w-full p-2 pl-11 group text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear`}
              >
                Logros
              </Link>
            </li>
          </ul>
        </li>
        <li>
          <Link
            onClick={onClose}
            href="/home"
            className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
          >
            <ScaleIcon />
            <span className={`${colors.fuenteAlterna} flex-1 ml-3 whitespace-nowrap`}>Proyectos</span>
          </Link>
        </li>

        <li /* className={connected ? 'hidden' : ''} */>
          <Link
            onClick={onClose}
            href="/trade"
            className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
          >
            <MarketIcon />
            <span className={`${colors.fuenteAlterna}  flex-1 ml-3 whitespace-nowrap`}>Mercado P2P</span>
          </Link>
        </li>
      </ul>
    </div>
    <div>
      <ul className="space-y-4">
        <li>
          <Link
            href="https://suan-1.gitbook.io/documentacion-suan-sandbox/"
            target="_blank"
            className="flex items-center p-2 text-black rounded-lg hover:bg-custom-dark hover:text-white transition duration-150 ease-linear"
          >
            <BookIcon />
            <span className={`${colors.fuenteAlterna} flex-1 ml-3 whitespace-nowrap`}>Ayuda</span>
          </Link>
        </li>
        <li className="pt-4 mt-4 border-t text-xs font-light border-gray-200 flex flex-col items-center justify-center text-center">
          {poweredBy && (
            <div className={`${colors.fuenteAlterna} flex items-center mt-2 mb-4`}>
              Powered by
              <Image
                src="/images/home-page/suan_logo.png"
                height={10}
                width={12}
                className="ml-1"
                alt="SUAN Logo"
              />
            </div>
          )}
          <div>
            <p className={`${colors.fuenteAlterna} `}>Copyright © Derechos de autor</p>
            <p className={`${colors.fuenteAlterna} `} >Todos los derechos reservados</p>
            <p className={`${colors.fuenteAlterna} `} >Suan 2001-2023</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</aside>
  );
}
