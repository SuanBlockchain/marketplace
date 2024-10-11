import dynamic from 'next/dynamic';
import { signInAuth } from '@terrasacha/backend';
import Image from 'next/image';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import LoginForm from '@marketplaces/ui-lib/src/lib/auth/LoginForm';

const Login = (props: any) => {
  return (
    <div className="relative w-full min-h-screen flex bg-slate-200 justify-center items-center">
  <div className="absolute inset-0 z-0">
    <Image
      priority={true}
              src="/v2/bg2.avif"
      alt="landing-suan-image"
      layout="fill"
      objectFit="cover"
      objectPosition="center"
      className="z-0"
    />
  </div>
 

      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />
        <LoginForm
          logo="/v2/logoterrasacha.svg"
          widthLogo={400}
          heightLogo={80}
          appName="Terrasacha"
          signInAuth={signInAuth}
          poweredby={true}
        />
      </div>
    </div>
  );
};

export default Login;
Login.Layout = 'NoLayout';
