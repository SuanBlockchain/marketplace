import dynamic from 'next/dynamic';
import ConfirmPassword from '@marketplaces/ui-lib/src/lib/auth/ConfirmPassword';
import Image from 'next/image';
import { forgotPasswordSubmit, forgotPassword } from '@cauca/backend';
const ForgotPasswd = (props: any) => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.avif"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: '0' }}
      />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center z-10">
        <ConfirmPassword
          logo="/images/home-page/suan_logo.png"
          widthLogo={60}
          heightLogo={60}
          appName="Suan"
          forgotPassword={forgotPassword}
          forgotPasswordSubmit={forgotPasswordSubmit}
        />
      </div>
    </div>
  );
};

export default ForgotPasswd;
ForgotPasswd.Layout = 'NoLayout';