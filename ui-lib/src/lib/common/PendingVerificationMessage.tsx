import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { CheckIcon } from '../icons/CheckIcon';
import axios from 'axios';

export default function PendingVerificationMessage() {
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);

  // Cargar el SDK de Persona al montar el componente
  useEffect(() => {
    const loadPersonaScript = () => {
      console.log('Intentando cargar el SDK de Persona...');
      const script = document.createElement('script');
      script.src = 'https://cdn.withpersona.com/dist/persona-v5.0.0.js';
      script.integrity = 'sha384-0LXHuG9ceBdEVRdF698trmE0xe0n9LgW8kNTJ9t/mH3U8VXJy0jNGMw/jPz9W82M';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        console.log('Persona SDK cargado correctamente');
      };
      script.onerror = (error) => {
        console.error('Error al cargar el SDK de Persona:', error);
      };
      document.body.appendChild(script);
    };

    loadPersonaScript();

    return () => {
      const personaScript = document.querySelector("script[src='https://cdn.withpersona.com/dist/persona-v5.0.0.js']");
      if (personaScript) {
        document.body.removeChild(personaScript);
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userId = currentUser.userId;
  
        if (!userId) {
          console.error('El id del usuario es indefinido');
          return;
        }
  
        setUser(userId);
  
        const response = await fetch(
          `/api/validations/validUser?userId=${userId}`
        );
        let userValidation = await response.json();
        console.log('uservalid', userValidation);
  
        // Si tiene cuenta ya cumplió la verificación básica
        if (userId) {
          userValidation.isValidatedStep1 = true;
        }
  
        if (userValidation) {
          setVerificationStatus(userValidation);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setVerificationStatus({
          isValidatedStep1: false,
          isValidatedStep2: false,
        });
      }
    };
  
    fetchData();
  }, []);

 const handleStartVerification = () => {
  console.log('Intentando iniciar el flujo de verificación...');
  setLoading(true);
  setStatus(null);

  if ((window as any).Persona) {
    console.log('Persona SDK disponible, iniciando flujo...');
    const client = new (window as any).Persona.Client({
      templateId: 'itmpl_vky7ZY8yh6LmeJzApg1smgumm5Pw', // GovID + Selfie
      environment: 'sandbox', // Cambia a 'production' cuando estés listo
      onReady: () => {
        client.open();
      },
      onComplete: async ({ inquiryId, status }: { inquiryId: string; status: string }) => {
        console.log(`Verificación completada: Inquiry ID = ${inquiryId}, Status = ${status}`);
        setLoading(false);
        setStatus(status === 'completed' ? 'success' : 'error');

        if (status === 'completed') {
          localStorage.setItem('isVerified', 'true'); // Guardar estado de verificación
          if (user) {
            console.log('Actualizando estado a isValidatedStep2: true');
            await updateVerificationStatus(true, user); // Actualiza isValidatedStep2 a true
            setVerificationStatus((prevState: any) => ({
              ...prevState,
              isValidatedStep2: true,
            })); // Actualizar el estado local
          } else {
            console.error('El id del usuario es indefinido');
          }
        } else {
          localStorage.setItem('isVerified', 'false'); // Guardar estado de verificación fallida
          if (user) {
            console.log('Actualizando estado a isValidatedStep2: false');
            await updateVerificationStatus(false, user); // Actualiza isValidatedStep2 a false
            setVerificationStatus((prevState: any) => ({
              ...prevState,
              isValidatedStep2: false,
            })); // Actualizar el estado local
          } else {
            console.error('El id del usuario es indefinido');
          }
        }
      },

      onError: (error: any) => {
        console.error('Error en la verificación de Persona:', error);
        setLoading(false);
        setStatus('error');
      }
    });
  } else {
    console.error('Persona SDK no está disponible en el objeto window.');
    setLoading(false);
    setStatus('error');
  }
};

  
  const updateVerificationStatus = async (isValidatedStep2: boolean, userId: string) => {
    try {
      const mutation = `
        mutation MyMutation {
          updateUser(input: { id: "${userId}", isValidatedStep2: ${isValidatedStep2} }) {
            id
            isValidatedStep2
          }
        }
      `;
      console.log('Enviando mutación GraphQL:', mutation); // Log para ver la mutación que se envía
      const response = await axios.post(`${process.env.NEXT_PUBLIC_graphqlEndpoint}`, { query: mutation }, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY_PLATAFORMA }
      });
  
      console.log('Respuesta de la actualización:', response.data); // Log para ver la respuesta del servidor
      console.log('Estado de verificación Pro actualizado');
    } catch (error) {
      console.error('Error actualizando el estado de verificación Pro:', error);
    }
  };
  
  

 
  
  const renderVerificationLevels = () => {
    return (
      <div className="space-y-4">
        <div className="pl-4">
          <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 pl-2">
            <li className="ms-6">
              <span
                className={`absolute flex items-center justify-center w-8 h-8 ${
                  verificationStatus?.isValidatedStep2
                    ? 'bg-green-200'
                    : 'bg-gray-100'
                }  rounded-full -start-4 ring-4 ring-white`}
              >
                {verificationStatus?.isValidatedStep2 ? (
                  <CheckIcon className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 16"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z" />
                  </svg>
                )}
              </span>
              <h3 className="font-medium leading-tight">Verificación Pro</h3>
              <p className="text-sm">Validación de documento</p>
              <p className="text-sm">Reconocimiento facial</p>
              {!verificationStatus?.isValidatedStep2 && (
                <button
                  type="button"
                  className={`text-white disabled:opacity-50 bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 mt-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800`}
                  disabled={!verificationStatus?.isValidatedStep1}
                  onClick={handleStartVerification} // Ejecutar verificación Pro
                >
                  <CheckIcon className="h-3 w-3 me-2" />
                  Verificación Pro
                </button>
              )}
            </li>
          </ol>
        </div>
      </div>
    );
  };

  const renderVerificationDetails = () => {
    if (
      !verificationStatus?.isValidatedStep1 ||
      !verificationStatus?.isValidatedStep2
    ) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            ¡Verifica tu cuenta para realizar compras mediante FIAT!
          </h3>
          <div className="text-md">
            Para poder disfrutar de todas las ventajas de comprar con moneda
            FIAT en nuestro sitio, necesitamos que verifiques tu cuenta. Este
            sencillo paso nos ayuda a garantizar la seguridad y la protección de
            tus transacciones.
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {verificationStatus && (
        <>
          <div
            id="alert-additional-content-3"
            className="p-4 mb-5 space-y-4 text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800"
            role="alert"
          >
            <div className="flex flex-col space-y-4">
              {renderVerificationDetails()}
              {renderVerificationLevels()}
            </div>
          </div>
        </>
      )}
    </>
  );
}
