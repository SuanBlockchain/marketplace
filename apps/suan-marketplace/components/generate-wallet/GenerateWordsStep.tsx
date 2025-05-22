import React, { useContext, useState } from 'react';
import { Checkbox, Label, Button, Radio } from 'flowbite-react';
import NewWalletContext from '@suan/store/generate-new-wallet-context';
import WordsContainer from './WordsContainer';
import { useRouter } from 'next/router';

const options = [
  { id: 'twentyfour', value: 24, name: 'Veinticuatro' },
  { id: 'twentyone', value: 21, name: 'Veintiuno' },
  { id: 'eighteen', value: 18, name: 'Dieciocho' },
  { id: 'fifteen', value: 15, name: 'Quince' },
  { id: 'twelve', value: 12, name: 'Doce' },
];
const GenerateWordsStep = (props: any) => {
  const { words, setWords, recoveryWords, setRecoveryWords } =
    useContext<any>(NewWalletContext);

  const router = useRouter()
  const setCurrentSection = props.setCurrentSection;
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateWords = async () => {
  try {
    setLoading(true);
    const response = await fetch(`api/calls/generateWords?size=${recoveryWords.length}`)
    const data  = await response.json()
    setWords(data);
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
  } finally {
    setLoading(false);
  }
};


  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <section className="pb-2">
        <h2 className="text-2xl font-semibold text-center">Palabras de Recuperación</h2>
      </section>
  
      <p className="pb-4 text-gray-500 text-sm text-center md:text-left">
        Las palabras que aparecen a continuación se denominan frase de recuperación. 
        Le permiten restaurar y acceder a sus fondos en cualquier monedero Cardano. 
        Por favor, escríbalas en papel en el orden indicado y no las almacene en un servicio en línea.
      </p>
  
      <section className="pb-2">
        <h2 className="font-normal">Cantidad de palabras</h2>
      </section>
  
      <p className="pb-4 text-gray-500 text-sm">
        Selecciona la cantidad de palabras que deseas generar para recuperar tu billetera
      </p>
  
      {words === null && (
        <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {options.map((option, index) => (
            <div className="flex items-center gap-2" key={index}>
              <Radio
                id={option.id}
                name="words"
                defaultChecked={option.value === 24}
                value={option.value}
                onClick={() => setRecoveryWords(Array(option.value).fill(''))}
                style={{ color: 'black', boxShadow: 'none' }}
              />
              <Label htmlFor={option.id}>{option.value} palabras</Label>
            </div>
          ))}
        </fieldset>
      )}
  
      <WordsContainer useCase="generate" generateWords={generateWords} loading={loading} />
  
      {words === null && (
        <div className="flex justify-center mt-3">
          <Button
            className="px-6"
            onClick={() => { setCurrentSection(1); router.push('/') }}
            color="gray"
          >
            Volver
          </Button>
        </div>
      )}
  
      {words !== null && (
        <>
          <div className="flex items-center gap-2 mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              viewBox="0 -960 960 960"
              width="45"
            >
              <path d="M440-440h80v-200h-80v200Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
            </svg>
            <p className="text-sm text-black">
              Estas palabras le permitirán restaurar y acceder a sus fondos en cualquier monedero Cardano. 
              Por favor, escríbalas en papel en el orden indicado, y no las almacene en un servicio en línea.
            </p>
          </div>
  
          <div className="flex flex-col sm:flex-row items-start gap-3 mt-3">
            <Checkbox
              id="alreadycopy"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="h-5 w-5"
            />
            <Label htmlFor="alreadycopy" className="text-sm">
              He copiado las palabras y las he guardado en un lugar seguro.
            </Label>
          </div>
  
          <div className="flex flex-col md:flex-row items-center justify-between mt-5 gap-3">
            <Button className="w-full md:w-auto px-6" color="gray" onClick={() => router.push('/')}>
              Volver
            </Button>
            <Button
              className={`w-full md:w-auto px-6 ${
                isChecked ? 'bg-black text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
              disabled={!isChecked}
              onClick={() => setCurrentSection(2)}
            >
              Continuar
            </Button>
          </div>
        </>
      )}
    </div>
  );
  
};
export default GenerateWordsStep;
