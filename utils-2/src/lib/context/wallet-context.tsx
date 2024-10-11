import { createContext, useEffect, useMemo, useState } from 'react';
import { getProjects } from '@marketplaces/data-access';
import { getActualPeriod, getAssetsLockedValue } from '../utils-2';
import { BsWindowSidebar } from 'react-icons/bs';
import { MinLovelaceResponse } from '../generic/getAssetsLockedValue';


const WalletContext = createContext({});

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletID, setWalletID] = useState<any>(null);
  const [walletName, setWalletName] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<any>(null);
  const [walletStakeAddress, setWalletStakeAddress] = useState<any>(null);
  const [walletBySuan, setWalletBySuan] = useState<boolean>(false);
  const [walletAdmin, setWalletAdmin] = useState<boolean>(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [lastSyncDate, setLastSyncDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [prevBalance, setPrevBalance] = useState(null);
  const [balanceChanged, setBalanceChanged] = useState(0);
  const [walletLockedBalance, setWalletLockedBalance] = useState<MinLovelaceResponse>(null);
  const [walletAvailableBalance, setWalletAvailableBalance] = useState<any>(null);
  const [walletTotalBalance, setWalletTotalBalance] = useState<any>(null);

  const handleWalletData = async ({
    walletID,
    walletName,
    walletAddress,
    isWalletBySuan = false,
    isWalletAdmin = false,
  }: any) => {
    if (walletAddress) {
      setWalletID(walletID);
      setWalletName(walletName);
      setWalletAddress(walletAddress);
      setWalletBySuan(isWalletBySuan);
      setWalletAdmin(isWalletAdmin);
      const updatedWalletData = await fetchWalletData(walletAddress);
      setWalletStakeAddress(updatedWalletData.stake_address);
      /* const projectsData = await getProjects();

      const mappedAssetsPrice = await Promise.all(
        projectsData.map(async (project: any) => {
          const tokenHistoricalData = JSON.parse(
            project.productFeatures.items.filter((item: any) => {
              return item.featureID === 'GLOBAL_TOKEN_HISTORICAL_DATA';
            })[0]?.value || '[]'
          );

          const periods = tokenHistoricalData.map((tkhd: any) => {
            return {
              period: tkhd.period,
              date: new Date(tkhd.date),
              price: tkhd.price,
              amount: tkhd.amount,
            };
          });

          const actualPeriod = await getActualPeriod(Date.now(), periods);

          const tokenCurrency =
            project.productFeatures.items.filter((item: any) => {
              return item.featureID === 'GLOBAL_TOKEN_CURRENCY';
            })[0]?.value || '';

          const tokenName =
            project.productFeatures.items.filter((item: any) => {
              return item.featureID === 'GLOBAL_TOKEN_NAME';
            })[0]?.value || '';

          const tokenPrice = actualPeriod?.price;

          return {
            tokenName: tokenName,
            tokenPrice: tokenPrice,
            tokenCurrency: tokenCurrency,
          };
        })
      );
      console.log('mappedAssetsPrice', mappedAssetsPrice); */
      // const updatedAssetsPrice = updatedWalletData.assetes.map(
      //   async (asset: any, index: number) => {
      //     // Listar todos los tokens de todos los proyectos y su precio actual

      //     return asset;
      //   }
      // );
      return updatedWalletData;
    }
    return null;
  };

  const handleClearData = () => {
    setWalletID(null);
    setWalletName(null);
    setWalletAddress(null);
    setWalletStakeAddress(null);
    setWalletBySuan(false);
    setWalletAdmin(false);
    setWalletData(null);
    setLastSyncDate(null);
    setIsLoading(false);
    setPrevBalance(null);
    setBalanceChanged(0);
  };

  const fetchWalletData = async (wAddress: string | null = null) => {
    setIsLoading(true);
    console.log('fetch wallet data');
    const wallet_address = walletAddress || wAddress;
    if (wallet_address) {
      const response = await fetch(
        '/api/calls/backend/getWalletBalanceByAddress',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wallet_address),
        }
      );
      let responseData = await response.json();
      if(responseData.error){
        responseData = {
          address: wallet_address,
          stake_address: '',
          script_address: false,
          balance: '0',
          assets: []
        }
      }
      if (prevBalance === null) {
        setPrevBalance(responseData.balance);
      }
      console.log(responseData, 'responseData')

      const blockedLovelace = await getAssetsLockedValue(wallet_address, responseData.assets)
      
      setWalletData(responseData);

      if(blockedLovelace && responseData.balance) {
        setWalletTotalBalance(responseData.balance);
        setWalletAvailableBalance(responseData.balance - blockedLovelace);
        setWalletLockedBalance(blockedLovelace);
      }

      setIsLoading(false);
      setLastSyncDate(Date.now());

      return responseData;
    }
    setIsLoading(false);
    setWalletData(null);
    return null;
  };

  useEffect(() => {
    let intervalTime = 30000;
    let intervalId : any;
    if(!window.sessionStorage.getItem('checkBalance')){
      const timestamp = Date.now()
      window.sessionStorage.setItem('checkBalance', JSON.stringify(timestamp))
    }
    const startPolling = () => {
      intervalId = setInterval(async () => {
        const timestamp = Date.now();
        //@ts-ignore
        const timeToVerify = parseInt(window.sessionStorage.getItem('checkBalance')) + intervalTime;
        if (timestamp > timeToVerify) {
          window.sessionStorage.setItem('checkBalance', JSON.stringify(timestamp));
          const walletData = await fetchWalletData();

          if (walletData) {
            const newBalance = walletData.balance;
            if (prevBalance !== newBalance && prevBalance !== null) {
              setBalanceChanged(newBalance - prevBalance);

              setTimeout(() => {
                setBalanceChanged(0);
              }, 2000);
            }
            setPrevBalance(newBalance);
          }
        }
      }, 2000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        clearInterval(intervalId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (document.visibilityState === 'visible') {
      startPolling();
    }

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchWalletData]);

  const connected = () => {
    if (walletData) {
      return true;
    } else {
      return false;
    }
  };

  const contextProps = useMemo(
    () => ({
      walletID,
      walletName,
      walletAddress,
      walletStakeAddress,
      walletBySuan,
      walletAdmin,
      walletData,
      isLoading,
      lastSyncDate,
      balanceChanged,
      walletLockedBalance,
      walletAvailableBalance,
      walletTotalBalance,
      handleWalletData,
      handleClearData,
      fetchWalletData,
      connected,
    }),
    [walletData]
  );

  return (
    <WalletContext.Provider value={contextProps}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletContext;
