import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import Sidebar from '@marketplaces/ui-lib/src/lib/layout/Sidebar';
import Navbar from '@marketplaces/ui-lib/src/lib/layout/Navbar';
import { useWallet, useAddress, useLovelace } from '@meshsdk/react';
import { useRouter } from 'next/router';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import WalletContext from '@marketplaces/utils-2/src/lib/context/wallet-context';
import HomeSkeleton from "@marketplaces/ui-lib/src/lib/common/skeleton/HomeSkeleton"

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

const initialStatewalletInfo = {
  name: '',
  addr: '',
  externalWallet: false,
};
const MainLayout = ({ children }: PropsWithChildren) => {
  const { connect, connected, disconnect, name, wallet } = useWallet();
  const { walletData } = useContext<any>(WalletContext);
  const [allowAccess, setAllowAccess] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<any>(initialStatewalletInfo);
  const [balance, setBalance] = useState<any>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const { handleWalletData } = useContext<any>(WalletContext);
  useEffect(() => {
    if (walletData) {
      getRates().then((rates) => {
        console.log(rates, 'rates 47');
        setBalance((walletData.balance / 1000000).toFixed(4));
        setBalanceUSD((walletData.balance / 1000000) * rates.ADArateUSD);
      });
    }
  }, [walletData]);
  useEffect(() => {
    if (window.sessionStorage.getItem('hasTokenAuth') === 'true') {
      setAllowAccess(true);
    }
    const fetchData = async () => {
      let access = false;

      try {
        const res = await accessHomeWithWallet();
        if (res) {
          const response = await fetch('/api/calls/backend/getWalletByUser', {
            method: 'POST',
            body: res,
          });
          const wallet = await response.json();
          if (wallet.length < 0) return router.push('/');
          if (wallet.length > 0) {
            const walletData = await handleWalletData({
              walletID: wallet[0].id,
              walletName: wallet[0].name,
              walletAddress: wallet[0].address,
              isWalletBySuan: true,
              isWalletAdmin: wallet[0].isAdmin,
            });
            console.log(walletData, 'walletData mainlayout');
            const walletAddress = wallet[0].address;
            const hasTokenAuthFunction = await checkTokenStakeAddress(
              wallet[0].address
            );
            const userData = await fetchUserAttributes();
            if (
              hasTokenAuthFunction ||
              (userData['custom:role'] === 'marketplace_admin' &&
                userData['custom:subrole'] ===
                  process.env.NEXT_PUBLIC_MARKETPLACE_NAME?.toLowerCase())
            ) {
              window.sessionStorage.setItem('hasTokenAuth', 'true');
              const address = wallet[0].address;
              setAllowAccess(true);
              setWalletInfo({
                name: (wallet[0] as any)?.name,
                addr: address,
              });
              const balance: any =
                (parseInt(walletData.balance) / 1000000).toFixed(4) || 0;
              getRates().then((rates) => {
                setBalance(balance);
                setBalanceUSD(balance * rates.ADArateUSD);
              });
              access = true;
            } else {
              sessionStorage.removeItem('preferredWalletSuan');
              /* disconnect(); */
              return router.push('/');
            }
          }
        }

        if (!access) {
          let walletName: any = sessionStorage.getItem('preferredWalletSuan');
          if (walletName) {
            connect(walletName);
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (connected) {
      console.log('entro');
      if (window.sessionStorage.getItem('hasTokenAuth') === 'true') {
        setAllowAccess(true);
      }
      const fetchData = async () => {
        const changeAddress = await wallet.getChangeAddress();
        const rewardAddresses = await wallet.getRewardAddresses();
        /* const utxos = await wallet.getUtxos();
        console.log('utxos', utxos); */

        const hasTokenAuthFunction = await checkTokenStakeAddress(
          changeAddress
        );
        console.log(hasTokenAuthFunction, 'hasTokenAuthFunction');
        const walletExists = await checkIfWalletExist(
          changeAddress,
          rewardAddresses[0],
          true
        );
        if (hasTokenAuthFunction) {
          window.sessionStorage.setItem('hasTokenAuth', 'true');
          setWalletInfo({
            name: name,
            addr: changeAddress,
            externalWallet: true,
          });
          if (hasTokenAuthFunction) {
            setAllowAccess(true);
          } else {
            sessionStorage.removeItem('preferredWalletSuan');
            disconnect();
            return router.push('/');
          }
        }
      };
      fetchData();
    }
  }, [connected]);

  const checkTokenStakeAddress = async (rewardAddresses: any) => {
    let tokenAuthOnSessionStorage =
      window.sessionStorage.getItem('hasTokenAuth');
    if (tokenAuthOnSessionStorage === 'true') return true;
    const response = await fetch('/api/calls/backend/checkTokenStakeAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rewardAddresses),
    });
    const hasTokenStakeAddress = await response.json();
    return hasTokenStakeAddress;
  };
  const accessHomeWithWallet = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
      return user.userId;
    } catch {
      return false;
    }
  };
  const checkIfWalletExist = async (
    address: string,
    stake_address: string,
    claimed_token: boolean
  ) => {
    const response = await fetch('/api/calls/backend/checkWalletByAddress', {
      method: 'POST',
      body: JSON.stringify({
        stake_address,
      }),
    });
    const walletInfoOnDB = await response.json();
    const walletData = await handleWalletData({
      walletID: walletInfoOnDB.data.id,
      walletName: '',
      walletAddress: walletInfoOnDB.data.address,
      isWalletAdmin: walletInfoOnDB.data.isAdmin,
    });
    if (!walletInfoOnDB.data) {
      const response = await fetch('/api/calls/backend/manageExternalWallets', {
        method: 'POST',
        body: JSON.stringify({
          address,
          stake_address,
          claimed_token,
        }),
      });
      const data = await response.json();

      await handleWalletData({
        walletID: data.data.id,
        walletName: '',
        walletAddress: data.data.address,
        isWalletAdmin: false,
      });
      return data;
    }
    return walletInfoOnDB;
  };
  const handleSidebarStatus = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {allowAccess ? (
        <>
          <Navbar
            walletInfo={walletInfo}
            handleSidebarStatus={handleSidebarStatus}
          />
          <Sidebar
            isOpen={isOpen}
            balance={balance}
            balanceUSD={balanceUSD}
            onClose={handleSidebarStatus}
            user={user}
            appName="Suan"
            image="/images/home-page/suan_logo.png"
            heightLogo={120}
            widthLogo={60}
            poweredBy={true}
            //poweredBy={false}
          />
          <main className="lg:ml-80 mt-20">{children}</main>
        </>
      ) : (
        <HomeSkeleton />
      )}
    </>
  );
};

export async function getServerSideProps() {
  const res = await fetch(`https://.../data`);
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}

export default MainLayout;