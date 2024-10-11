import LoadingPage from '@marketplaces/ui-lib/src/lib/common/LoadingPage';
import RedirectToHome from '@marketplaces/ui-lib/src/lib/landing/RedirectToHome';
import WelcomeCard from '@marketplaces/ui-lib/src/lib/landing/WelcomeCard';
import EnableMFA from '@marketplaces/ui-lib/src/lib/auth/EnableMFA';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
const Login = (props: any) => {
  const { loading, walletcount, checkingWallet, walletData } = props;
  const [user, setUser] = useState<any>(null);
  const [setupMFA, setSetupMFA] = useState(false)
  useEffect(() => {
    currentAuthenticatedUser();
  }, []);
  const toBoolean = (str: string) => {
    return str === "true";
  }
  async function currentAuthenticatedUser() {
    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes()
      const MFA = toBoolean(userAttributes['custom:setMFA'] || '')
      if(!MFA){
        setSetupMFA(true)
      }
      setUser(user);
      
    } catch (err) {
      console.log(err);
    } finally {
      /* setLoading(false) */
    }
  }
  Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedOut':
        setUser(null);
        break;
    }
  });
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
      <div className="font-jostItalic h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        {loading ? (
          <LoadingPage message="Consultando la información del usuario" />
        ) : 
        setupMFA ? 
        <EnableMFA />
        :
        walletcount === 0 ? (
          <WelcomeCard
            checkingWallet={checkingWallet}
            handleSetCheckingWallet={props.handleSetCheckingWallet}
            appName="Terrasacha"
            poweredby={true}
          />
        ) : (
          checkingWallet !== 'checking' && (
            <RedirectToHome
              width_image={400}
              image={'/v2/logo.svg'}
              poweredby={true}
              appName={'Terrasacha'}
              checkingWallet={checkingWallet}
              walletData={walletData}
              handleSetCheckingWallet={props.handleSetCheckingWallet}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Login;
