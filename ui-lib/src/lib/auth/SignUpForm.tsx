// components/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Label, Select } from 'flowbite-react';
import { TailSpin } from 'react-loader-spinner';
import { Tooltip } from 'react-tooltip';
import { event } from '../common/event';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';

interface SignUpFormProps {
  handleSetSignUpStatus: (data: string) => void;
  logo: string;
  widthLogo: number;
  heightLogo: number;
  appName: string;
  signUpAuth: any;
  poweredby: boolean;
}
const initialStateErrors = { confirmPassword: '', createUserError: '', emailError: '' };
const deafultStateShowInfo = { password: false, passwordConfirm: false };

const SignUpForm = (props: SignUpFormProps) => {
  const {
    handleSetSignUpStatus,
    logo,
    widthLogo,
    heightLogo,
    appName,
    signUpAuth,
    poweredby,
  } = props;
  const router = useRouter();
  const [signupForm, setSignupForm] = useState<any>({
    username: '',
    password: '',
    email: '',
    role: 'investor',
  });
  const [extraForm, setExtraForm] = useState<any>({ confirmPassword: '' });
  const [errors, setErrors] = useState<any>(initialStateErrors);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState(deafultStateShowInfo) as any[];

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSignupForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const handleChangeExtraForm = (e: any) => {
    const { name, value } = e.target;
    setExtraForm((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitForm = async () => {
    setLoading(true);
    setErrors(initialStateErrors);
    try {
      if (signupForm.password !== extraForm.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      await signUpAuth(signupForm);
      //analytics
      event({
        action: 'sign_up',
        category: 'marketplace',
        label: 'New user created',
        value: signupForm.username
      });
      router.push({
        pathname: '/auth/confirm-code',
        query: { email: signupForm.email}
      });
    } catch (error: any) {
      if (signupForm.password !== extraForm.confirmPassword) {
        setErrors((preForm: any) => ({
          ...preForm,
          confirmPassword: 'Las contraseñas no coinciden', // Actualiza aquí
        }));
      } else if (error.name === 'UsernameExistsException') {
        setErrors((preForm: any) => ({
          ...preForm,
          createUserError: 'El nombre de usuario ya existe',
        }));
      } else if (error.name === 'UsernameExistsException') {
        setErrors((preForm: any) => ({
          ...preForm,
          createUserError: 'El nombre de usuario ya existe',
        }));
      } else if (error.name === 'InvalidPasswordException') {
        setErrors((preForm: any) => ({
          ...preForm,
          confirmPassword: 'La contraseña debe tener al menos 8 caracteres (Ver Condiciones Requeridas)',
        }));
      } else if (error.name === 'InvalidParameterException') {
        if(error.message === 'Invalid email address format.'){

          setErrors((preForm: any) => ({
            ...preForm,
            emailError:
              'Email inválido',
          }));
        } else{
          setErrors((preForm: any) => ({
            ...preForm,
            createUserError:
              'El nombre de usuario no satisface las Condiciones Requeridas',
          }));
        }
      }
    } finally {
      setLoading(false);
    }
  };
  const handleShowInfo = (e: any, name: string) => {
    e.preventDefault();
    setShowInfo({
      ...showInfo,
      [name]: !showInfo[name],
    });
  };
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <div className="w-full flex justify-center mb-8">
        <Image
          src="/v2/logoterrasacha.svg"
          width={widthLogo}
          height={heightLogo}
          alt={`${appName} logo`}
        />
      </div>
      <h2 className="font-jostBold text-3xl font-normal pb-2 flex">
        Regístrate
        {/*         <a className='' data-tooltip-id="my-tooltip" data-tooltip-content={"Consideraciones: El nombre de usuario no puede contener espacios. La contraseña debe tener más de 8 caracteres y poseer al menos un valor numérico"}> <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
        </a> */}
      </h2>
      <p className="font-jostItalic text-xs">
        Condiciones Requeridas: El nombre de usuario no puede contener espacios ni
        caracteres especiales. La contraseña debe tener más de 8 caracteres y
        poseer al menos un valor numérico
      </p>
      <form className="pt-10 pb-5">
        <div className="relative z-0 w-full mb-4 group">
          <input
            type="text"
            value={signupForm.username}
            name="username"
            onChange={handleChange}
            className={`font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${
              errors.createUserError !== ''
                ? 'border-red-400'
                : 'border-gray-300'
            } appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
            placeholder="Nombre de usuario"
            required
          />
          <p
            className={`${
              errors.createUserError === '' && 'hidden'
            } Font-JostRegular text-red-400 text-xs`}
          >
            {/* Otro contenido */}
            {errors.createUserError && (
              <p style={{ fontFamily: 'Jost, sans-serif', color: '#f87171' }}>
                {errors.createUserError}
              </p>
            )}
          </p>
        </div>
        <div className="font-jostRegular relative z-0 w-full mb-4 group">
          <input
            type="email"
            value={signupForm.email}
            name="email"
            onChange={handleChange}
            className={`font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${
              errors.emailError !== ''
                ? 'border-red-400'
                : 'border-gray-300'
            } appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}

            placeholder="Email"
            required
          />
          <p
            className={`${
              errors.emailError === '' && 'hidden'
            } Font-JostRegular text-red-400 text-xs`}
          >
            {/* Otro contenido */}
            {errors.emailError && (
              <p style={{ fontFamily: 'Jost, sans-serif', color: '#f87171' }}>
                {errors.emailError}
              </p>
            )}
          </p>
        </div>
        <div className="font-jostRegular relative z-0 w-full mb-4 group">
          <input
            type={showInfo.password ? 'text' : 'password'}
            value={signupForm.password}
            name="password"
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className={`font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${
              errors.confirmPassword !== ''
                ? 'border-red-400'
                : 'border-gray-300'
            } appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
            placeholder="Contraseña"
            required
          />
          <button
            className="font-jostRegular absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={(e) => handleShowInfo(e, 'password')}
          >
            {showInfo.password ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
          </button>
          <p className="text-xs text-red-400">{errors.confirmPassword}</p>
        </div>
        <div className="font-jostRegular relative z-0 w-full mb-2 group">
          <input
            type={showInfo.passwordConfirm ? 'text' : 'password'}
            value={extraForm.confirmPassword}
            name="confirmPassword"
            onChange={handleChangeExtraForm}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className={`font-jostRegular block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 ${
              errors.confirmPassword !== ''
                ? 'border-red-400'
                : 'border-gray-300'
            } appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
            placeholder="Confirmar contraseña"
            required
          />
          <button
            className="font-jostBold absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={(e) => handleShowInfo(e, 'passwordConfirm')}
          >
            {showInfo.passwordConfirm ? (
              <BsFillEyeFill />
            ) : (
              <BsFillEyeSlashFill />
            )}
          </button>
        </div>
        <div className="max-w-md mb-2">
          <div className="mb-2 block">
            <Label className="font-jostRegular " value="Tipo de usuario:" />
          </div>
          <Select
            name="role"
            value={signupForm.role}
            onChange={handleChange}
            className="font-jostRegular rounded-sm" // Estilo aplicado al select
          >
            <option value="investor">Inversionista</option>
            <option value="constructor">Propietario</option>
          </Select>
        </div>
      </form>

      <div className="font-jostRegular  flex items-center mb-4">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={() => setTermsAccepted(!termsAccepted)}
          className="font-jostRegular  w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="font-jostRegular  ml-2 text-xs font-light text-gray-900 dark:text-gray-300">
          Acepto los{' '}
          <span className="font-jostRegular  text-blue-600">
            términos y condiciones
          </span>
        </label>
      </div>
      <div className="font-jostRegular flex items-center mb-4">
        <input
          type="checkbox"
          checked={privacyAccepted}
          onChange={() => setPrivacyAccepted(!privacyAccepted)}
          className="font-jostRegular w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="font-jostRegular ml-2 text-xs font-light text-gray-900 dark:text-gray-300">
          Acepto la{' '}
          <span className="font-jostRegular text-blue-600">
            política de privacidad de datos
          </span>
        </label>
      </div>
      <button
        type="button"
        onClick={() => submitForm()}
        className={`relative w-full flex items-center justify-center h-10 font-jostBold focus:z-10 focus:outline-none text-white bg-custom-marca-boton border border-transparent enabled:hover:bg-custom-marca-boton-variante  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2`}
        disabled={
          signupForm.password.length === 0 ||
          signupForm.username.length === 0 ||
          signupForm.email.length === 0 ||
          extraForm.confirmPassword.length === 0 ||
          !termsAccepted ||
          !privacyAccepted
        }
      >
        {loading ? (
          <TailSpin
            width="20"
            color="#fff"
            wrapperClass="font-jostRegular absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          'Regístrarse'
        )}
      </button>
      <p className="font-jostRegular text-sm pt-1 w-full text-center">
        ¿Ya tienes una cuenta?
        <Link
          href={
            router.query.fromGenerateWallet === 'true'
              ? '/auth/login?fromGenerateWallet=true'
              : '/auth/login'
          }
          className="font-jostRegular text-[#50A4FF] text-sm pl-1"
        >
          Ingresa aquí
        </Link>
      </p>
      {poweredby && (
        <div className="font-jostRegular flex items-center justify-center mt-4 text-xs">
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
      <Tooltip id="my-tooltip" />
    </div>
  );
};

export default SignUpForm;
