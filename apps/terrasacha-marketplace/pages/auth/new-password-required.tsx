import React, { useState } from 'react';
import NewPasswordRequired from '@marketplaces/ui-lib/src/lib/auth/NewPasswordRequired';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title'
import { confirmSignInAuth } from '@suan/backend';
import { MyPage } from '@suan/components/common/types';
import Image from 'next/image';

const NewPasswordRequiredPage: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.avif"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />

        <NewPasswordRequired
          logo="/v2/logo.svg"
          widthLogo={250}
          heightLogo={100}
          appName="Suan"
          confirmSignInAuth={confirmSignInAuth}
        />
      </div>
    </div>
  );
};

export default NewPasswordRequiredPage;
NewPasswordRequiredPage.Layout = 'NoLayout';
