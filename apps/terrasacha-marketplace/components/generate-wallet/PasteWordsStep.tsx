import React, { useContext, useState, useEffect } from 'react';
import { Checkbox, Label, Button } from 'flowbite-react';
import NewWalletContext from '@terrasacha/store/generate-new-wallet-context';
import WordsContainer from './WordsContainer';
import { FaPen } from 'react-icons/fa';
import { set } from 'lodash';
const PasteWordsStep = (props: any) => {
  const {
    recoveryWords,
    words,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(NewWalletContext);
  const setCurrentSection = props.setCurrentSection;
  const [inputValue, setInputValue] = useState('') as any[];
  const [dictionary, setDictionary] = useState([]) as any[];
  const [errorInput, setErrorInput] = useState(false) as any[];
  useEffect(() => {
    setRecoveryWords(Array(recoveryWords.length).fill(''));
    setNextRecoveryWordIndex(0);
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
    if (words === recoveryWordsCopy.join(' ')) {
      setRecoveryWords(recoveryWordsCopy);
      setNextRecoveryWordIndex(recoveryWordsCopy.indexOf(''));
      setInputValue('');
    } else {
      console.log(`La frase de recuperación no coincide.`);
    }
  };

  const handleKeyDown = (e: any, index: number, value: string) => {
    if (e.key === 'Enter') {
      if (value.includes(' ')) {
        const copywords = value.split(' ');
        return updateRecoveryWordsCopy(copywords);
      }
      updateRecoveryWords(index, value, 'input');
    }
  };
  const compareAndSaveWord = (from: string, value: string) => {
    setErrorInput(false);
    let currentWord: any = null;
    let wordInDictionary = null;
    if (from === 'button') {
      currentWord = value;
      /* console.log(
        `button, currentWord: ${currentWord}, nextRecoveryWord: ${
          words.split(" ")[nextRecoveryWordIndex]
        }`
      ); */
      if (currentWord === words.split(' ')[nextRecoveryWordIndex]) {
        return words.split(' ')[nextRecoveryWordIndex];
      } else {
        setErrorInput(true);
        return false;
      }
    } else {
      currentWord = words.split(' ')[nextRecoveryWordIndex];
      wordInDictionary = dictionary.filter((word: string) =>
        word.includes(inputValue)
      );
      if (currentWord.includes(inputValue) && wordInDictionary.length === 1) {
        return wordInDictionary[0];
      } else {
        setErrorInput(true);
        return false;
      }
    }
  };

  return (
    <div>
      <section className="flex justify-between pb-2">
        <h2 className="w-full text-2xl font-semibold text-center">
          Palabras de Recuperación
        </h2>
      </section>
      <div className="flex gap-2 mt-1 words_write">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="25"
          viewBox="0 -960 960 960"
          width="25"
        >
          <path d="M440-440h80v-200h-80v200Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
        </svg>
        <p className="text-sm text-black-500 ">
          Ahora escribe tus palabras en el mismo orden, asegúrate de que nadie
          mira tu pantalla.
        </p>
      </div>
      <WordsContainer useCase="recovery" />
      <p className="w-full rounded-lg p-3 bg-slate-600 text-white  text-md font-semibold  py-2">
        Empieza a escribir para ver sugerecias de palabras.
      </p>
      <div className="relative w-full mt-2">
        <FaPen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={inputValue}
          disabled={nextRecoveryWordIndex === -1}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, nextRecoveryWordIndex, inputValue)}
          className={`w-full rounded-lg pl-10 bg-slate-200 text-gray-600 text-lg font-semibold border-2 ${
            errorInput && inputValue.length > 0
              ? 'border-red-600 focus:ring-red-600 focus:border-red-600'
              : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
          } `}
        />
      </div>
      <div className="grid grid-cols-5 gap-x-2 gap-y-2 py-4">
        {inputValue.length > 2 &&
          dictionary
            .filter((word: string) => word.includes(inputValue))
            .map((word: string, index: number) => {
              return (
                <button
                  key={index}
                  className="border border-slate-200 py-2 px-5 rounded-lg bg-slate-200 text-gray-600 font-semibold hover:border-gray-500"
                  onClick={() =>
                    updateRecoveryWords(nextRecoveryWordIndex, word, 'button')
                  }
                >
                  {word}
                </button>
              );
            })}
      </div>
      <div className="flex w-full justify-end mt-6">
        <Button
          className="px-8"
          color="gray"
          onClick={() => setCurrentSection(2)}
        >
          Vover
        </Button>
        <Button
          className="px-8 ml-4"
          disabled={recoveryWords.join(' ') !== words}
          onClick={() => setCurrentSection(3)}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default PasteWordsStep;
