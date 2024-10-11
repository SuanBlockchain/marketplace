import React, { useContext, useState, useEffect } from 'react';
import { Radio, Label, Button } from 'flowbite-react';
import RestoreWalletContext from '@marketplaces/ui-lib/src/lib/store/restore-wallet-context';
import WordsContainer from './WordsContainer';
import { FaPen } from 'react-icons/fa';
import { useRouter } from 'next/router';
const options = [
  { id: 'twentyfour', value: 24, name: 'Veinticuatro' },
  { id: 'twentyone', value: 21, name: 'Veintiuno' },
  { id: 'eighteen', value: 18, name: 'Dieciocho' },
  { id: 'fifteen', value: 15, name: 'Quince' },
  { id: 'twelve', value: 12, name: 'Doce' },
];
import Image from 'next/image'; // Importa Image de Next.js
const PasteWordsStep = (props: any) => {
  const {
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(RestoreWalletContext);
  const router = useRouter();
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState('') as any[];
  const [dictionary, setDictionary] = useState([]) as any[];
  const [errorInput, setErrorInput] = useState(false) as any[];
  useEffect(() => {
    setRecoveryWords(Array(24).fill(''));
    fetchDictionary();
  }, []);

  const fetchDictionary = async () => {
    const response = await fetch(
      'https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt'
    );
    const data = await response.text();
    setDictionary(data.split('\n'));
  };

  const updateRecoveryWords = (index: number, value: string, from: string) => {
    console.log(value);
    const saveWord = compareAndSaveWord(from, value);
    if (saveWord) {
      const updateRecoveryWords = [...recoveryWords];
      updateRecoveryWords[index] = saveWord;
      setRecoveryWords(updateRecoveryWords);
      setNextRecoveryWordIndex(updateRecoveryWords.indexOf(''));
      setInputValue('');
    }
  };
  const updateRecoveryWordsCopy = (copywords: string[]) => {
    const recoveryWordsCopy = [...recoveryWords];
    copywords.forEach((word, index) => {
      recoveryWordsCopy[index] = word;
    });

    setRecoveryWords(recoveryWordsCopy);
    setNextRecoveryWordIndex(copywords.length);
    setInputValue('');
  };

  const handleKeyDown = (e: any, index: number, value: string) => {
    if (e.key === 'Enter') {
      if (value.includes(' ')) {
        const copywords = value.split(' ');
        if (checkcopyWords(copywords))
          return updateRecoveryWordsCopy(copywords);
      }
      updateRecoveryWords(index, value, 'input');
    }
  };
  const compareAndSaveWord = (from: string, value: string) => {
    setErrorInput(false);
    let currentWord: any = null;
    let wordInDictionary = null;
    if (from === 'input') {
      currentWord = value;
      wordInDictionary = dictionary.filter((word: string) =>
        word.includes(inputValue)
      );
      if (currentWord.includes(inputValue) && wordInDictionary.length === 1) {
        console.log(wordInDictionary[0]);
        return wordInDictionary[0];
      } else {
        setErrorInput(true);
        return false;
      }
    }
    if (from === 'button') {
      console.log(value);
      return value;
    }
  };
  const checkcopyWords = (copywords: Array<string>) => {
    const lengthCopyWords = copywords.length;
    let copywordsOnDicc = 0;
    copywords.forEach((item) => {
      if (dictionary.some((word: string) => word === item)) {
        copywordsOnDicc += 1;
      }
    });

    if (copywordsOnDicc === lengthCopyWords) return true;
    return false;
  };
  const changeWordsLength = (option: any) => {
    setRecoveryWords(Array(option).fill(''));
    setNextRecoveryWordIndex(0);
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
      <section className="flex flex-col items-center pb-2">
        <div className="flex justify-center">
          <h2 className="w-full text-2xl font-semibold pb-2 font-jostBold">
            Palabras de Recuperación
          </h2>
        </div>
      </section>
      <h4 className="w-full text-md font-jostRegular">
        ¿Qué tipo de billetera le gustaría restaurar?
      </h4>

      <p className="w-5/6 text-sm py-2 font-jostItalic">
        Nota: De las billeteras existentes Daedalus, Yoroi y Eternl utilizan
        frases de recuperación de 15 o 24 palabras. También son comunes las de
        12 palabras. Los monederos de la era Byron no están soportados
        actualmente. Si necesita recuperar un monedero anterior a agosto de
        2020, utilice Yoroi.
      </p>

      <fieldset className="flex gap-2 mb-2 bg-cu">
        {options.map((option, index) => {
          return (
            <div className="flex items-center gap-2 bg-cu" key={index}>
              <Radio
                id={option.id}
                name="words"
                defaultChecked={option.value === 24}
                value={option.value}
                onClick={(e) => changeWordsLength(option.value)}
              />
              <Label htmlFor={option.id}>{option.value} palabras</Label>
            </div>
          );
        })}
      </fieldset>
      <WordsContainer useCase="recovery" />
      <p className="w-full rounded-lg p-3 bg-custom-marca-boton-variante text-white  text-md   py-2 font-jostRegular">
        Empieza a escribir para ver sugerencias de palabras.
      </p>
      <div className="relative w-full mt-2 bg-cu">
        <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2  text-black " />
        <input
          type="text"
          value={inputValue}
          disabled={nextRecoveryWordIndex === -1}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, nextRecoveryWordIndex, inputValue)}
          className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-jostBold border-2 ${
            errorInput && inputValue.length > 0
              ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
              : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
          } `}
        />
      </div>
      <div className="grid grid-cols-5 gap-x-2 gap-y-2 py-4 font-jostItalic">
        {inputValue.length > 2 &&
          dictionary
            .filter((word: string) => word.includes(inputValue))
            .map((word: string, index: number) => {
              return (
                <button
                  key={index}
                  className="border border-slate-200 py-2 px-5 rounded-lg bg-slate-200 text-gray-600 font hover:border-gray-500"
                  onClick={() =>
                    updateRecoveryWords(nextRecoveryWordIndex, word, 'button')
                  }
                >
                  {word}
                </button>
              );
            })}
      </div>
      <div className="flex w-full justify-end mt-6  ">
        <Button
          className="font-jostBold relative group flex items-center h-10 justify-center p-1 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton  enabled:hover:bg-custom-marca-boton-variante border border-transparent rounded-lg focus:ring-2 px-8 ml-4"
          onClick={() => {
            setCurrentSection(1);
            router.push('/');
          }}
          color="gray"
        >
          Volver
        </Button>

        <button
          className="font-jostBold group flex items-center justify-center h-10 px-8 text-center font-medium focus:z-10 focus:outline-none text-white bg-custom-marca-boton hover:bg-custom-marca-boton-variante border border-transparent  dark:bg-cyan-600 dark:hover:bg-cyan-700  rounded-lg focus:ring-2 ml-4"
          disabled={recoveryWords.includes('')}
          onClick={() => setCurrentSection(2)}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default PasteWordsStep;
