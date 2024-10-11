import React, { useState, useContext, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { FaPen } from 'react-icons/fa';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import NewWalletContext from '@terrasacha/store/generate-new-wallet-context';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';
import { encryptPassword, updateWallet } from '@marketplaces/data-access';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Image from 'next/image'; // Importa Image de Next.js

const deafultState = { walletname: '', password: '', passwordConfirm: '' };
const deafultStateShowInfo = { password: false, passwordConfirm: false };
const CreateCredentials = (props: any) => {
  const { words, user, setWalletInfo } = useContext<any>(NewWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState(deafultState) as any[];
  const [showInfo, setShowInfo] = useState(deafultStateShowInfo) as any[];
  const [errors, setErrors] = useState(deafultState) as any[];
  const [loading, setLoading] = useState(false) as any[];
  const [userIsAdmin, serUserIsAdmin] = useState(false);

  useEffect(() => {
    fetchUserAttributes()
      .then((data) => {
        if (data['custom:role'] === 'marketplace_admin' && data) {
          serUserIsAdmin(true);
        }
      })
      .catch((error) => {
        console.log('error obteniendo data del usuario', error);
      });
  }, []);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(deafultState);
    setInputValue({
      ...inputValue,
      [event.target.name]: event.target.value,
    });
  };
  const handleShowInfo = (name: string) => {
    setShowInfo({
      ...showInfo,
      [name]: !showInfo[name],
    });
  };
  const checkifPasswordMatch = () => {
    if (
      inputValue.password === inputValue.passwordConfirm &&
      inputValue.password.length > 5 &&
      inputValue.passwordConfirm.length > 5
    ) {
      return true;
    } else {
      return false;
    }
  };
  const handleContinue = async () => {
    if (inputValue.walletname.length < 5) {
      setErrors({
        ...errors,
        walletname:
          'El nombre de la billetera debe tener al menos 5 caracteres',
      });
      return;
    }
    if (inputValue.password.length < 8) {
      setErrors({
        ...errors,
        password: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }
    if (!checkifPasswordMatch()) {
      setErrors({
        ...errors,
        passwordConfirm: 'Las contraseñas no coinciden',
      });
      return;
    }
    await createWallet();
  };
  const createWallet = async () => {
    const info = {
      mnemonic_words: words,
      wallet_type: 'user',
      userID: user,
      save_flag: true,
    };
    try {
      setLoading(true);
      const response = await fetch('api/calls/createWalletCredentials', {
        method: 'POST',
        body: JSON.stringify(info),
      });

      const data = await response.json();
      setWalletInfo({
        name: inputValue.walletname,
        passwd: inputValue.password,
      });
      console.log(data, 'data response1');
      const response2 = await fetch('api/calls/backend/updateWallet', {
        method: 'POST',
        body: JSON.stringify({
          id: data.wallet_id,
          name: inputValue.walletname,
          passphrase: inputValue.password,
          isAdmin: userIsAdmin,
        }),
      });
      setCurrentSection(4);
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="flex flex-col items-center pb-2">
        <Image
          src="/v2/logo.svg"
          alt="Logo"
          width={500} // Ajusta el tamaño según sea necesario
          height={500} // Ajusta el tamaño según sea necesario
          className="mb-4" // Margen inferior para separar la imagen del texto
        />{' '}
      </section>
      <section className="flex justify-between pb-2">
        <h2 className="text-3xl font-jostBold text-center w-full">
          Crea tu billetera de Cardano
        </h2>
      </section>
      <label className="font-jostBold text-slate-600">
        Nombre de la billetera{' '}
        <span className="font-light text-xs text-red-500">
          {errors.walletname}
        </span>
      </label>
      <div className="relative w-full mt-2">
        <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Ejemplo: Mi billetera de Cardano"
          name="walletname"
          value={inputValue.walletname}
          onChange={(e) => handleInputChange(e)}
          className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
            errors.walletname.length > 0
              ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
              : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
          }`}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4 mt-6">
        <div>
          <label className="font-jostBold text-slate-600">
            Introduzca la nueva contraseña
          </label>
          <div className="relative w-full mt-2">
            <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showInfo.password ? 'text' : 'password'}
              name="password"
              value={inputValue.password}
              placeholder="Introduzca una contraseña"
              onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
                errors.password.length > 0
                  ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
                  : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
              }`}
            />
            <button
              className="font-JostBold absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => handleShowInfo('password')}
            >
              {showInfo.password ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
            </button>
          </div>
          <p className="font-light text-red-500 text-sm">{errors.password}</p>
        </div>
        <div>
          <label className="font-jostBold text-slate-600">
            Repita la nueva contraseña
          </label>
          <div className="relative w-full mt-2">
            <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showInfo.passwordConfirm ? 'text' : 'password'}
              placeholder="Repetir contraseña"
              value={inputValue.passwordConfirm}
              name="passwordConfirm"
              onChange={(e) => handleInputChange(e)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
                errors.passwordConfirm.length > 0
                  ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
                  : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
              }`}
            />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => handleShowInfo('passwordConfirm')}
            >
              {showInfo.passwordConfirm ? (
                <BsFillEyeFill />
              ) : (
                <BsFillEyeSlashFill />
              )}
            </button>
          </div>
          <p className="font-light text-red-500 text-xs">
            {errors.passwordConfirm}
          </p>
        </div>
      </div>
      <div className="flex w-full justify-end mt-6 ">
        <button
          className="font-jostBold relative group flex items-center h-10 justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent rounded-lg focus:ring-2 px-8 ml-4"
          onClick={() => setInputValue(deafultState)}
        >
          Limpiar campos
        </button>

        <button
          className="font-jostBold relative group flex items-center h-10 justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent rounded-lg focus:ring-2 px-8 ml-4"
          onClick={() => handleContinue()}
        >
          {loading ? (
            <TailSpin
              width="20"
              color="#fff"
              wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 "
            />
          ) : (
            'Continuar'
          )}{' '}
        </button>
      </div>
    </div>
  );
};

export default CreateCredentials;
