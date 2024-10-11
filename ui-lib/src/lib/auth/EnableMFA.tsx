import { useQRCode } from 'next-qrcode';
import { useState, useEffect } from 'react';
import {
  getCurrentUser,
  setUpTOTP,
  updateUserAttribute,
  verifyTOTPSetup,
  updateMFAPreference,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import { TailSpin } from 'react-loader-spinner';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { signOut } from 'aws-amplify/auth';
import { AiOutlineInfoCircle } from 'react-icons/ai';

interface dataToShareMFA {
  username: string;
  env: string;
  secret: string;
}
const usersRoles: string[] = ['marketplace_admin', 'admin', 'admon'];
const EnableMFA = (props: any) => {
  const router = useRouter();
  const { Canvas } = useQRCode();
  const [setupMFA, setSetupMFA] = useState<any>('');
  const [codeChecked, setCodeChecked] = useState<boolean>(false);
  const [secretMFA, setSecretMFA] = useState<string>('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [code, setCode] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };
  async function handleTOTPVerification() {
    setCheckLoading(true);
    try {
      await verifyTOTPSetup({ code: code });
      toast.success('Código válido', {
        className: 'font-custom text-lg', // Cambia 'font-custom' por la clase que desees
      });
      setCodeChecked(true);
    } catch (error: any) {
      const errorString = error.toString();
      if (errorString.includes('Code mismatch')) {
        toast.error('Código inválido', {
          className: 'font-custom text-lg', // Cambia 'font-custom' por la clase que desees
        });
      } else if (errorString.includes('failed to satisfy constraint')) {
        toast.error(
          'El código no cumple la condición de tener una longitud de 6 caracteres',
          {
            className: 'font-custom text-lg', // Cambia 'font-custom' por la clase que desees
          }
        );
      }
    } finally {
      setCheckLoading(false);
    }
  }
  async function handleTOTPSetup() {
    try {
      const totpSetupDetails = await setUpTOTP();
      setSecretMFA(totpSetupDetails.sharedSecret);
      const appName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'app_name';
      const setupUri = totpSetupDetails.getSetupUri(appName);
      setSetupMFA(setupUri);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    handleTOTPSetup();
  }, []);
  async function handleUpdateMFAPreference() {
    setSaveLoading(true);
    try {
      const userData = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      const variableToCheck: string | undefined = userAttributes['custom:role'];

      const dataToAPI: dataToShareMFA = {
        username: userData.username,
        env: process.env.NEXT_PUBLIC_ENV || 'INTERNAL',
        secret: secretMFA,
      };
      if (
        variableToCheck !== undefined &&
        usersRoles.includes(variableToCheck)
      ) {
        sendSecret(dataToAPI);
      }
      await updateMFAPreference({ totp: 'ENABLED' });
      await updateUserAttribute({
        userAttribute: { attributeKey: 'custom:setMFA', value: 'true' },
      });
      return router.reload();
    } catch (error) {
      console.log(error);
    } finally {
      setSaveLoading(false);
    }
  }
  const sendSecret = (dataToAPI: dataToShareMFA): void => {
    fetch(
      'https://vhal4tf7id.execute-api.us-east-1.amazonaws.com/dev/advertise-mfa-important-user',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToAPI),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
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
      fuenteVariante: string;
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
  };

  return (
    <div className="bg-white rounded-2xl w-[45rem] max-w-[45rem] 2xl:w-[45%] py-10 px-10 sm:px-10 h-auto flex flex-col justify-center">
      <div>
        <div className="flex p-6 justify-center">
          <div className="w-full flex justify-center">
            {/* Aquí agregamos el logo */}
            <img src="/v2/logo.svg" alt="Logo" className="h-24 w-auto" />
          </div>
        </div>
        <h1 className={`${colors.fuente}  text-3xl  pb-3 text-center`}>
          Autentificación Multi-factor (MFA)
        </h1>
        <p className={`${colors.fuenteAlterna} pb-1 text-center`}>
          Lee el QR con tu dispositivo móvil.
        </p>
      </div>
      <div className="flex p-6">
        <div className="w-[70%] flex justify-center">
          {setupMFA ? (
            <Canvas
              text={`${setupMFA}` || 'loading'}
              options={{
                errorCorrectionLevel: 'M',
                margin: 5,
                scale: 6,
                width: 300,
                color: {
                  dark: '#1e293b',
                  light: '#fff',
                },
              }}
            />
          ) : (
            <div>
              <TailSpin width={30} />
            </div>
          )}
        </div>
        <div
          className={`${colors.fuenteVariante}  flex flex-col w-full justify-center`}
        >
          <input
            type="text"
            className=""
            value={code}
            onChange={handleInputChange}
            placeholder="Ingresa el código MFA"
          />
<div className="relative group inline-block">
      <button className={`v text-gray-400 ml-2`}>
        <div className="text-yellow-500 p-2 flex items-center">
          <AiOutlineInfoCircle size={30} className="cursor-pointer text-orange-500" />
        </div>
      </button>
      
      {/* Tooltip */}
      <div className={`${colors.fuenteVariante}  absolute invisible group-hover:visible bg-black text-white text-lg rounded py-1 px-2 bottom-full mb-1`}>
        Debe tener instalado Google Authenticator en su móvil y escanear el código QR.
      </div>
    </div>
          <button
            className={`relative w-full mt-6 flex items-center h-10 justify-center ${colors.fuente}  focus:z-10 focus:outline-none text-white ${colors.bgColor} border border-transparent enabled:${colors.hoverBgColor}  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2`}
            onClick={() => handleTOTPVerification()}
          >
            {checkLoading ? (
              <TailSpin
                width="20"
                color="#fff"
                wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            ) : (
              'Checkear'
            )}
          </button>
          <button
            disabled={!codeChecked}
            className={`relative w-full mt-6 flex items-center h-10 justify-center ${
              colors.fuente
            }  focus:z-10 focus:outline-none text-white ${
              codeChecked ? colors.bgColor : colors.bgColorAlternativo
            } disabled:cursor-not-allowed border border-transparent enabled:${
              colors.hoverBgColor
            }  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2`}
            onClick={() => handleUpdateMFAPreference()}
          >
            {saveLoading ? (
              <TailSpin
                width="20"
                color="#fff"
                wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            ) : (
              'Continuar'
            )}
          </button>
          <button
            className={`relative w-full mt-6 flex items-center h-10 justify-center ${colors.fuente} focus:z-10 focus:outline-none border border-custom-marca-boton text-custom-marca-boton ${colors.bgColorAlternativo} ${colors.hoverBgColor} dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 py-2`}
            onClick={() => {
              signOut().then(() => router.reload());
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnableMFA;
