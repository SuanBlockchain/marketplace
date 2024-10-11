import React, { use, useContext, useEffect, useState } from 'react';
import { MyPage } from '@terrasacha/components/common/types';
import Image from 'next/image';
import { Button } from 'flowbite-react';
import NewWallet from '@terrasacha/components/generate-wallet/NewWallet';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { signOutAuth } from '@terrasacha/backend';
import { useRouter } from 'next/router';
import AlreadyHasWallet from '@terrasacha/components/generate-wallet/AlreadyHasWallet';

const GenerateWalletPage: MyPage = (props: any) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null) as any;
  const [wallet, setWallet] = useState(null) as any;
  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      if (!res) {
        setIsAuthenticated(false);
        return router.push('/');
      }
      setIsAuthenticated(true);
      fetch('/api/calls/backend/getWalletByUser',{
        method: 'POST',
        body: res,
      })
      .then(response => response.json())
      .then((data) => {
        setWallet(data);
      });
    });
  }, []);
  Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedIn':
        currentAuthenticatedUser().then((res) => {
          setIsAuthenticated(res);
        });
        break;
      case 'signedOut':
        currentAuthenticatedUser().then((res) => {
          setIsAuthenticated(res);
        });
        break;
    }
  });

  async function currentAuthenticatedUser() {
    try {
      const { userId } = await getCurrentUser();
      return userId;
    } catch (err) {
      return false;
    }
  }

  async function signout() {
    try {
      await signOutAuth();
      router.push('/');
    } catch (err) {
      console.log(err);
    }
  }
  if (!wallet) return <div>Cargando...</div>;
  return (
<div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center">
  <div className="absolute inset-0 z-0">
    <Image
      priority={true}
              src="/v2/bg3.avif"
      alt="landing-suan-image"
      layout="fill"
      objectFit="cover"
      objectPosition="center"
      className="z-0"
    />
  </div>
 
  <div className="relative z-10 mt-10 mb-10 w-[50rem] h-auto">
    {isAuthenticated && wallet.length === 0 && <NewWallet />}
    {isAuthenticated && wallet.length > 0 && <AlreadyHasWallet />}
  </div>
</div>
  );
};

export default GenerateWalletPage;
GenerateWalletPage.Layout = 'NoLayout';
