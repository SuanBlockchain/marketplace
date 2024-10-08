// components/LoginForm.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'sonner';
export interface ConfirmCodeProps {
  logo: string;
  widthLogo: number;
  heightLogo: number;
  appName: string;
  confirmSignInAuth: any;
}
const initialState = {
    challengeResponse: ''
};
const NewPasswordRequired = (props: ConfirmCodeProps) => {
  const {
    logo,
    widthLogo,
    heightLogo,
    appName,
    confirmSignInAuth
  } = props;
  const router = useRouter();
  const [errors, setErrors] = useState<any>('');
  const [loading, setLoading] = useState(false);
  const [confirmationCode, seetConfirmationCode] = useState<any>(initialState);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors('');
    const { name, value } = e.target;
    seetConfirmationCode((prevForm: any) => ({
      ...prevForm,
      [name]: value,
    }));
  };
  const submitFromConfirmationCode = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await confirmSignInAuth(confirmationCode);
      console.log(data, 'confirmSignInAuth')
      if (data) {
        router.push('/');
      }
    } catch (error: any) {
      setErrors('La contraseña no cumple los requisitos de seguridad.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-2xl w-[35rem] max-w-[35rem] 2xl:w-[38%] py-10 px-12 sm:px-20 h-auto flex flex-col justify-center">
      <div className="w-full flex justify-center mb-8">
        <Image
          src={logo}
          width={widthLogo}
          height={heightLogo}
          alt={appName + ' Logo'}
        />
      </div>
      <>
        <h2 className="text-3xl font-normal pb-2">Cambio de contraseña temporal</h2>
        <h4 className="text-1xl font-normal">Ingrese su nueva contraseña</h4>
        <p
          className={`${
            errors === '' && 'hidden'
          } text-red-400 text-xs`}
        >
          {errors.loginError}
        </p>
        <form className="pt-10" onSubmit={(e) => submitFromConfirmationCode(e)}>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              value={router.query.username}
              name="username"
              disabled
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Username
            </label>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="password"
              value={confirmationCode.challengeResponse}
              name="challengeResponse"
              onChange={handleChange}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
              Nueva contraseña
            </label>
          </div>
        </form>

        <button
          type="button"
          onClick={(e) => submitFromConfirmationCode(e)}
          disabled={confirmationCode.challengeResponse.length < 8}
          className={`relative flex items-center justify-center h-10 text-white ${
            confirmationCode.challengeResponse.length > 8
              ? 'bg-gray-800 hover:bg-gray-900'
              : 'bg-gray-500 hover:bg-gray-600'
          } focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-5 py-3 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 w-full mt-4`}
        >
          {loading ? (
            <TailSpin
              width="20"
              color="#fff"
              wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            'Confirmar contraseña'
          )}
        </button>
      </>
    </div>
  );
};

export default NewPasswordRequired;
