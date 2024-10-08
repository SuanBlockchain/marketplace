import React, {  useEffect, useState } from 'react';
import { MyPage } from '@cauca/components/common/types';
import Image from 'next/image';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/router';
import AlreadyHasWallet from '@cauca/components/generate-wallet/AlreadyHasWallet';
import RestoreWallet from '@cauca/components/restore-wallet/RestoreWallet';

const RestoreWalletPage: MyPage = (props: any) => {
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
  if (!wallet) return <div>Cargando...</div>;
  return (
    <div className="w-full min-h-screen h-auto flex bg-slate-200 justify-center">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.avif"
        alt="landing-suan-image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="z-10 mt-10 w-[50rem] h-auto">
        {isAuthenticated && wallet.length === 0 && <RestoreWallet />}
        {isAuthenticated && wallet.length > 0 && <AlreadyHasWallet />}
      </div>
    </div>
  );
};

export default RestoreWalletPage;
RestoreWalletPage.Layout = 'NoLayout';
