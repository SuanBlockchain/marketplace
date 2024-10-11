// components/LoginForm.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { TailSpin } from 'react-loader-spinner';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { AiOutlineInfoCircle } from 'react-icons/ai';
export interface ConfirmPasswordProps {
  logo: string;
  widthLogo: number;
  heightLogo: number;
  appName: string;
  forgotPasswordSubmit: any;
  forgotPassword: any;
}
const initialStateErrors = { usernameError: '' };
const initialStateloginForm = { username: '' };
const initialStateLoginFormRecovery = {
  username: '',
  confirmationCode: '',
  newPassword: '',
};
const ConfirmPassword = (props: ConfirmPasswordProps) => {
  const {
    logo,
    widthLogo,
    heightLogo,
    appName,
    forgotPassword,
    forgotPasswordSubmit,
  } = props;
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<any>(initialStateloginForm);
  const [errors, setErrors] = useState<any>(initialStateErrors);
  const [loading, setLoading] = useState(false);
  const [loginFormRecovery, setLoginFormRecovery] = useState<any>(
    initialStateLoginFormRecovery
  );
  const [actualStep, setActualStep] = useState<number>(1);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setLoginForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const handleChangeRecovery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(initialStateErrors);
    const { name, value } = e.target;
    setLoginFormRecovery((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitForm = async (event: any) => {
    event.preventDefault();
    forgotPassword(loginForm)
      .then((data: any) => {
        if (data) {
          setActualStep(2);
        }
      })
      .catch((error: any) => {
        setErrors((preForm: any) => ({
          ...preForm,
          loginError: error.name,
        }));
      });
  };
  const submitFormRecovery = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await forgotPasswordSubmit(loginFormRecovery);
      if (data) {
        router.push('/auth/login');
      }
    } catch (error: any) {
      setErrors((preForm: any) => ({
        ...preForm,
        loginError: error,
      }));
    } finally {
      setLoading(false);
    }
  };
  const deafultStateShowInfo = { password: false };
  const [showInfo, setShowInfo] = useState(deafultStateShowInfo) as any[];
  const handleShowInfo = (e : any, name: string) => {
    e.preventDefault()
    setShowInfo({
      ...showInfo,
      [name]: !showInfo[name],
    });
  };
  const marketplaceName =
  process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
const marketplaceColors: Record<
  string,
  {
    bgColor: string;
    hoverBgColor: string;
    bgColorAlternativo: string;
    fuente: string;
    fuenteAlterna: string;
    fuenteVariante:string;
  }
> = {
  Terrasacha: {
    bgColor: 'bg-custom-marca-boton',
    hoverBgColor: 'hover:bg-custom-marca-boton-variante',
    bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
    fuente: 'font-jostBold',
    fuenteAlterna: 'font-jostRegular',
    fuenteVariante: 'font-jostItalic',
  },

  // Agrega más marketplaces y colores aquí
};
const colors = marketplaceColors[marketplaceName] || {
  bgColor: 'bg-custom-dark',
  hoverBgColor: 'hover:bg-custom-dark-hover',
  bgColorAlternativo: 'bg-amber-400',
  fuente: 'font-semibold',
  fuenteAlterna: 'font-medium',
  fuenteVariante: 'font-normal',
};
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <div className="w-full flex justify-center mb-8">
        <Image
          src="/v2/logoterrasacha.svg"
          width={widthLogo}
          height={heightLogo}
          alt={`${appName} Logo`}
        />
      </div>
      {actualStep === 1 && (
        <>
          <h2 className="font-jostBold text-3xl font-normal pb-2">
            Recuperar contraseña
          </h2>
          <h4 className="font-jostRegular text-1xl font-normal">
            Ingrese sus datos:
          </h4>
          <div className="relative group inline-block">
      <button className={`v text-gray-400 ml-2`}>
        <div className="text-yellow-500 p-2 flex items-center">
          <AiOutlineInfoCircle size={30} className="cursor-pointer text-orange-500" />
        </div>
      </button>
      
      {/* Tooltip */}
      <div className={`${colors.fuenteVariante}  absolute invisible group-hover:visible bg-black text-white text-lg rounded py-1 px-2 bottom-full mb-1`}>
      El username-nombre de usuario no puede contener espacios ni caracteres especiales.
      </div>
    </div>
          <p
            className={`${
              errors.loginError === '' && 'hidden'
            } font-jostRegulartext-red-400 text-xs`}
          >
            <p
              className={`font-jostRegular text-red-400 text-xs ${
                errors.loginError ? '' : 'hidden'
              }`}
            >
              {errors.loginError
                ? 'Hubo un problema con el Username ingresado. Por favor, verifica tus credenciales.'
                : ''}
            </p>
          </p>
          <form className="pt-10" onSubmit={(e) => submitForm(e)}>
            <div className="font-jostRegular relative z-0 w-full mb-4 group">
              <input
                type="text"
                value={loginForm.username}
                name="username"
                onChange={handleChange}
                className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-400 peer"
                placeholder="username"
                required
              />
            
            </div>
          </form>
          <button
            type="submit"
            onClick={(e) => submitForm(e)}
            className={`font-jostBold relative flex items-center justify-center h-10 text-white ${
              loginForm.username.length > 0
                ? 'bg-custom-marca-boton  hover:bg-custom-marca-boton-variante'
                : 'bg-custom-marca-boton  hover:bg-custom-marca-boton-variante'
            } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
          >
            {loading ? (
              <TailSpin
                width="20"
                color="#fff"
                wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            ) : (
              'Recuperar'
            )}
          </button>
        </>
      )}
      {actualStep === 2 && (
        <>
          <h2 className="font-jostBold text-3xl font-normal pb-2">Recuperar contraseña</h2>
          <h4 className="font-jostRegular text-1xl font-normal">Ingrese sus datos</h4>
          <p
            className={`${
              errors.loginError === '' && 'hidden'
            } text-red-400 text-xs`}
          >
            {errors.loginError}
          </p>
                                    {/* Botón de información */}
      <div className="relative group inline-block">
      <button className={`v text-gray-400 ml-2`}>
        <div className="text-yellow-500 p-2 flex items-center">
          <AiOutlineInfoCircle size={30} className="cursor-pointer text-orange-500" />
        </div>
      </button>
      
      {/* Tooltip */}
      <div className={`${colors.fuenteVariante}  absolute invisible group-hover:visible bg-black text-white text-lg rounded py-1 px-2 bottom-full mb-1`}>
      El username-nombre de usuario no puede contener espacios ni caracteres especiales. El password, contraseña debe tener más de 8 caracteres y poseer al menos un valor numérico
      </div>
    </div>
          <form className="pt-10" onSubmit={(e) => submitFormRecovery(e)}>
            <div className="relative z-0 w-full mb-6 group">
              <input
                type="text"
                value={loginFormRecovery.confirmationCode}
                name="confirmationCode"
                onChange={handleChangeRecovery}
                className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="font-jostRegular peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Código de verificación
              </label>
            </div>
            <div className="font-jostRegular relative z-0 w-full mb-6 group">
              <input
                type="text"
                value={loginFormRecovery.username}
                name="username"
                onChange={handleChangeRecovery}
                className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Username
              </label>
            </div>
            <div className="font-jostRegular relative z-0 w-full mb-6 group">
              <input
                type={showInfo.password ? 'text' : 'password'}
                value={loginFormRecovery.newPassword}
                name="newPassword"
                onChange={handleChangeRecovery}
                className="font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                placeholder=" "
                required
              />
              <label className="font-jostRegular peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                Nueva contraseña
              </label>
              <button
            className="font-jostRegular absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={(e) => handleShowInfo(e, 'password')}
          >
            {showInfo.password ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
          </button>
            </div>
          </form>
          <button
            type="button"
            onClick={(e) => submitFormRecovery(e)}
            className={`relative h-10 flex items-center justify-center text-white ${
              loginForm.username.length > 0
             ? 'bg-custom-marca-boton  hover:bg-custom-marca-boton-variante'
              : 'bg-custom-marca-boton  hover:bg-custom-marca-boton-variante'
            } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
          >
            {loading ? (
              <TailSpin
                width="20"
                color="#fff"
                wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            ) : (
              'Recuperar'
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default ConfirmPassword;
