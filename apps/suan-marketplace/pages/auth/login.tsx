'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import Image from 'next/image';
import LoginForm from '@marketplaces/ui-lib/src/lib/auth/LoginForm';
import Title from '@marketplaces/ui-lib/src/lib/auth/Title';
import { signInAuth } from '@suan/backend';

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        if (session && session.tokens) {
          router.push('/home'); // Redirige a /home si el usuario está autenticado
        } else {
          router.push('/auth/login'); // Redirige a /auth/login si no hay sesión activa
        }
      } catch (error) {
        console.error('Error verificando la sesión:', error);
        router.push('/auth/login'); // En caso de error, redirige a la pantalla de login
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-200">
      <Image
        priority={true}
        src="/images/home-page/fondo_login.avif"
        alt="landing-suan-image"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }}
      />
      <div className="h-auto w-[90%] lg:w-[90%] 2xl:w-[80%] 3xl:w-[70%] flex justify-center 2xl:justify-between z-10">
        <Title />
        <LoginForm
          logo="/images/home-page/suan_logo.png"
          widthLogo={60}
          heightLogo={60}
          appName="Suan"
          signInAuth={signInAuth}
          poweredby={false}
        />
      </div>
    </div>
  );
};

export default Login;
Login.Layout = 'NoLayout';
