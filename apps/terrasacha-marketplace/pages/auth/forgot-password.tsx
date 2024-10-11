import dynamic from 'next/dynamic';
import ConfirmPassword from '@marketplaces/ui-lib/src/lib/auth/ConfirmPassword';
import Image from 'next/image';
import { forgotPasswordSubmit, forgotPassword } from '@terrasacha/backend';
const ForgotPasswd = (props: any) => {
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
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        <ConfirmPassword
             logo="/v2/logo.svg"
          widthLogo={250}
          heightLogo={250}
          appName="Terrasacha"
          forgotPassword={forgotPassword}
          forgotPasswordSubmit={forgotPasswordSubmit}
        />
      </div>
    </div>
  );
};

export default ForgotPasswd;
ForgotPasswd.Layout = 'NoLayout';
