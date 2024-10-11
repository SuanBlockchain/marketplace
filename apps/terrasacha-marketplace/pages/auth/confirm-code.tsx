import React, { useState } from 'react';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import ConfirmCode from '@marketplaces/ui-lib/src/lib/auth/ConfirmationCode'
import { confirmSignUpAuth, handleResendCode } from '@terrasacha/backend';
import { MyPage } from '@terrasacha/components/common/types';
import Image from 'next/image';

const ConfirmCodePage: MyPage = (props: any) => {
  const [signUpStatus, setSignUpStatus] = useState('signup');
  const handleSetSignUpStatus = (data: string) => {
    setSignUpStatus(data);
  };
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
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />

        <ConfirmCode
             logo="/v2/logo.svg"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          confirmSignUpAuth={confirmSignUpAuth}
          handleResendCode={handleResendCode}
        />
      </div>
    </div>
  );
};

export default ConfirmCodePage;
ConfirmCodePage.Layout = 'NoLayout';
