import React, { useContext, useState } from 'react';
import { Checkbox, Label, Button, Radio } from 'flowbite-react';
import NewWalletContext from '@terrasacha/store/generate-new-wallet-context';
import WordsContainer from './WordsContainer';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Importa Image de Next.js
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
    <div>
      <section className="flex flex-col items-center pb-2">
        <Image
          src="/v2/logo.svg"
          alt="Logo"
          width={500} // Ajusta el tamaño según sea necesario
          height={500} // Ajusta el tamaño según sea necesario
          className="mb-4" // Margen inferior para separar la imagen del texto
        /> </section>
      <section className="flex justify-between pb-2">
        <h2 className="text-2xl font-jostBold text-center w-full">
          Palabras de Recuperación
        </h2>
      </section>
      <p className="pb-4 font-jostItalic text-sm">
      Las palabras que se muestran a continuación conforman su frase de recuperación. 
      Esta frase es esencial para restaurar y acceder a sus fondos en cualquier monedero de Cardano.
       Se recomienda escribirla en papel en el orden exacto y no guardarla en ningún servicio en línea.
      </p>
      <section className="flex justify-between pb-2">
        <h2 className="text- font-jostBold">Cantidad de palabras</h2>
      </section>
      <p className="pb-4 font-jostRegular text-sm">
        Selecciona la cantidad de palabras que deseas generar para recuperar tu
        billetera
      </p>
      {words === null && <fieldset className="flex gap-2 mb-4">
        {options.map((option, index) => {
          return (
            <div className="flex items-center gap-2 font-jostRegular" key={index}>
              <Radio
                id={option.id}
                name="words"
                defaultChecked={option.value === 24}
                value={option.value}
                onClick={(e) => setRecoveryWords(Array(option.value).fill(''))}
              />
              <Label htmlFor={option.id}>{option.value} palabras</Label>
            </div>
          );
        })}
      </fieldset>}
      <WordsContainer
        useCase="generate"
        generateWords={generateWords}
        loading={loading}
      />
      {words === null && (
        <div className="flex w-full justify-end mt-3 font-jostBold">
          <Button
           className="font-jostBold relative group flex items-center h-10 justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent rounded-lg focus:ring-2 px-8 ml-4"
            onClick={() =>{ setCurrentSection(1); router.push('/')}}
            color="gray"
          >
            Volver
          </Button>
        </div>
      )}
      {words !== null && (
        <>
          <div className="flex items-center gap-2 mt-3 p-6 bg-custom-marca-boton-alterno rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="45"
              viewBox="0 -960 960 960"
              width="45"
            >
              <path d="M440-440h80v-200h-80v200Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
            </svg>
            <p className=" ml-2 text-sm text-gray-800">
              Estas palabras le permitirán restaurar y acceder a sus fondos en
              cualquier monedero Cardano. Por favor, escríbalas en papel en el
              en el orden indicado, y no las almacene en un servicio en línea.
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex h-5 items-center">
              <Checkbox
                id="alreadycopy"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="shipping">
                He copiado las palabras y las he guardado en un lugar seguro
              </Label>
            </div>
          </div>
          <div className="flex w-full justify-end mt-3">
            <Button
             className="group flex h-min items-center justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent  dark:bg-cyan-600 dark:enabled:hover:bg-cyan-700  rounded-lg focus:ring-2 px-8 ml-4"
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
