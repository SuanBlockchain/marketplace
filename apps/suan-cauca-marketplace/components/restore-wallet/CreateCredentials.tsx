import React, { useState, useContext, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { FaPen } from 'react-icons/fa';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import RestoreWalletContext  from '@marketplaces/ui-lib/src/lib/store/restore-wallet-context';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'sonner';
import { fetchUserAttributes } from 'aws-amplify/auth';

const deafultState = {
  walletname: '',
  password: '',
  passwordConfirm: '',
  mnemonics: '',
};
const deafultStateShowInfo = { password: false, passwordConfirm: false };
const CreateCredentials = (props: any) => {
  const { recoveryWords, user, setWalletInfo } =
    useContext<any>(RestoreWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState(deafultState) as any[];
  const [showInfo, setShowInfo] = useState(deafultStateShowInfo) as any[];
  const [errors, setErrors] = useState(deafultState) as any[];
  const [loading, setLoading] = useState(false) as any[];
  const [userIsAdmin, serUserIsAdmin] = useState(false)

  useEffect(() =>{
    fetchUserAttributes().then((data) =>{
      if(data['custom:role'] === 'marketplace_admin' && data){
        serUserIsAdmin(true)
      }
    }).catch((error) =>{
      console.log('error obteniendo data del usuario', error)
    })
  },[])
  useEffect(() => {
    if (errors.mnemonics !== '') {
      toast.error(errors.mnemonics);
    }
  }, [errors.mnemonics]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({
      walletname: '',
      password: '',
      passwordConfirm: '',
      mnemonics: errors.mnemonics,
    });
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
      mnemonic_words: recoveryWords.join(' '),
      wallet_type: 'user',
      userID: user,
      save_flag: true,
    };
    console.log(info, 'info');
    try {
      setLoading(true);
      const response = await fetch('api/calls/createWalletCredentials', {
        method: 'POST',
        body: JSON.stringify(info),
      });

      const data = await response.json();
      if (!data.detail) {
        setWalletInfo({
          name: inputValue.walletname,
          passwd: inputValue.password,
        });
        const response2 = await fetch('api/calls/backend/updateWallet', {
          method: 'POST',
          body: JSON.stringify({
            id: data.wallet_id,
            name: inputValue.walletname,
            passphrase: inputValue.password,
            isAdmin: userIsAdmin
          }),
        });
        const data2 = response2.json();
      } else {
        setErrors({
          ...errors,
          mnemonics:
            'La frase introducida no corresponde a una billetera existente. Por favor, vuelve a introducir la frase de recuperación.',
        });
        return setLoading(false);
      }
      //setCurrentSection(4);
      setCurrentSection(3);
    } catch (error) {
      console.error('Error al hacer la solicitud:', error);
    } finally {
    }
  };
  return (
    <div>
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-semibold text-center w-full">
          Crea tu billetera de Cardano
        </h2>
      </section>
      <label className="font-semibold text-slate-600">
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
          <label className="font-semibold text-slate-600">
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => handleShowInfo('password')}
            >
              {showInfo.password ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
            </button>
          </div>
          <p className="font-light text-red-500 text-sm">{errors.password}</p>
        </div>
        <div>
          <label className="font-semibold text-slate-600">
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
        <Button
          className="px-8"
          color="gray"
          onClick={() => setCurrentSection(1)}
        >
          Volver
        </Button>
        <button
          className="relative flex h-10 min-w-14 items-center justify-center p-2 font-medium focus:z-10 focus:outline-none text-white bg-cyan-700 border border-transparent enabled:hover:bg-cyan-800  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 ml-4"
          onClick={() => handleContinue()}
          disabled={errors.mnemonics}
        >
          {loading ? (
            <TailSpin
              width="20"
              color="#fff"
              wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateCredentials;
