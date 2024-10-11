// components/LoginForm.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import Image from 'next/image';
/* import { useWallet } from '@meshsdk/react'; */
import { useRouter } from 'next/router';
import CardanoWalletGeneric from '../cardano-wallet/CardanoWalletGenericButton';
interface WelcomeCardProps {
  poweredby: boolean;
  appName: string;
  checkingWallet: any;
  handleSetCheckingWallet: any;
}
const WelcomeCard = (props: WelcomeCardProps) => {
  const { poweredby, appName, checkingWallet, handleSetCheckingWallet } = props;
  const [userData, setUserData] = useState(null) as any;
  /* const { disconnect } = useWallet(); */
  const router = useRouter();
  useEffect(() => {
    currentAuthenticatedUser().then((res) => {
      setUserData(res);
    });
  }, []);
  useEffect(() => {
    if (checkingWallet === 'unauthorized') {
      setTimeout(() => {
        /* disconnect(); */
        handleSetCheckingWallet('uncheck');
      }, 1500);
    }
  }, [checkingWallet]);

  async function currentAuthenticatedUser() {
    try {
      const user = await getCurrentUser();
      if (user) return user;
    } catch (err) {
      return false;
    }
  }
  return (
    <div className="bg-white rounded-2xl w-[40rem] max-w-[35rem] 2xl:w-[45%] py-10 px-10 sm:px-10 h-auto flex flex-col justify-center">
      {appName === 'Terrasacha' && (
        <div className='flex justify-center'>
        <Image
          src="/v2/logoterrasacha.svg"
          width={400}
          height={80}
          alt="Logotipo de Terrasacha"
        />
        </div>
      )}

<h2 className="font-jostBold text-3xl  pb-4 flex justify-center text-center mt-8"
>
      {userData
        ? 'Crea tu billetera o utiliza una preexistente'
        : '¡Bienvenido a nuestro Marketplace!'}
    </h2>
      {userData ? (
        <p className="font-jostRegular text-sm text-center">
          {`El siguiente paso es crear tu billetera virtual o utilizar una que hayas creado previamente (asegúrate de tener tus mnemonics o grupo secreto de palabras). Para continuar, haz clic en "Crear billetera" o "Recuperar billetera". Luego, deberás seguir los requisitos indicados para poder solicitar tu token de acceso y, así, ingresar al Marketplace.`}
        </p>
      ) : (
        <p className="text-sm pb-2 text-center font-jostRegular">
     Para comenzar a usar la aplicación, necesitas una billetera virtual con el token de acceso
     de nuestra organización. 
     Puedes crear tu billetera y usuario directamente en nuestra plataforma.
          {/* , o conectar cualquier billetera externa oficial, recomendamos la utilización de "Eternl". 
          Si desea obtener más detalles sobre cómo crear una billetera en "Eternl", visite este
          <a href="https://suan-1.gitbook.io/documentacion-suan-sandbox"
              target="_blank"
              className="text-[#50A4FF]">enlace</a>. */}
        </p>
      )}

      <p
        className={`h-16 flex justify-center items-center text-sm ${
          checkingWallet === 'unauthorized' ? 'text-red-400' : 'text-slate-600'
        }`}
      >
        {/* {checkingWallet === 'uncheck'? '': checkingWallet} */}
        {checkingWallet === 'checking' ? 'Cargando...' : ''}
        {checkingWallet === 'authorized'
          ? 'Billetera autorizada. Redirigiendo...'
          : ''}
        {checkingWallet === 'unauthorized' ? 'Billetera no autorizada.' : ''}
      </p>
      {userData ? (
        <Link href={'/generate-wallet'}>
          <button className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2">

            Crear billetera
          </button>
        </Link>
      ) : (
        <Link href={'/auth/login'}>
        <button className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2">
          Ingresar
        </button>
      </Link>
      )
      }
      {userData && (
        <Link href="/restore-wallet">
      <button className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton  border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2 mt-4">

            Recuperar billetera
          </button>
        </Link>
      )}
      {userData && (
        <button className="font-jostBold relative w-full flex items-center justify-center font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton  border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2 mt-4"

          onClick={() => {
            signOut().then(() => router.reload());
          }}
        >
          Cerrar sesión como {userData.username}
        </button>
      )}
      {poweredby && (
        <div className="flex items-center justify-center mt-4 text-xs font-jostRegular">
          Powered by
          <Image
            src="/images/home-page/suan_logo.png"
            height={10}
            width={12}
            className="ml-2"
            alt={`${appName} logo`}
          />
        </div>
      )}
    </div>
  );
};

export default WelcomeCard;
