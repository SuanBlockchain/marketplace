import React, { useState, useEffect } from 'react';
import { ConfirmCode, SignUpForm } from '@marketplaces/ui-lib';
import { signUpAuth, confirmSignUpAuth } from '@terrasacha/backend';
import Title from '@terrasacha/components/auth/Title';
import { MyPage } from '@terrasacha/components/common/types';
import Image from 'next/image';

const ConfirmCodePage: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_signup.avif"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />

        <ConfirmCode
          logo="/images/home-page/terrasacha_logo_principal.png"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          confirmSignUpAuth={confirmSignUpAuth}
        />
      </div>
    </div>
  );
};

export default ConfirmCodePage;
ConfirmCodePage.Layout = 'NoLayout';