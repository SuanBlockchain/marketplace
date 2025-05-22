import React, { useEffect, useState, useContext } from 'react';
import { Spinner, Button } from 'flowbite-react';
import { FaRegCopy, FaCopy } from 'react-icons/fa6';
import { IoCloseSharp } from 'react-icons/io5';
import NewWalletContext from '@terrasacha/store/generate-new-wallet-context';
import { TailSpin } from 'react-loader-spinner';

const WordsContainer = (props: any) => {
  const {
    words,
    recoveryWords,
    setRecoveryWords,
    nextRecoveryWordIndex,
    setNextRecoveryWordIndex,
  } = useContext<any>(NewWalletContext);
  const { useCase, loading, generateWords } = props;
  const [wordsFormatted, setWordsFormatted] = useState(null) as any[];
  const [copied, setCopied] = useState(false) as any[];
  useEffect(() => {
    ``;
    if (words === null) return;
    setWordsFormatted(words.split(' '));
  }, [words]);

  const removeRecoveryWord = (index: number) => {
    const recoveryWordsCopy = [...recoveryWords];
    recoveryWordsCopy[index] = '';
    setRecoveryWords(recoveryWordsCopy);
    setNextRecoveryWordIndex(recoveryWordsCopy.indexOf(''));
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(words);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 100);
  };
  return wordsFormatted === null ? (
    <div className="w-full h-24 rounded-xl flex justify-center items-center">
      <Button
        className="w-full sm:w-auto px-6 h-10 text-white font-semibold bg-custom-marca-boton rounded-lg focus:ring-2 hover:bg-custom-marca-boton-variante transition"
        onClick={generateWords}
      >
        {loading ? <TailSpin width="20" color="#fff" /> : 'Generar palabras'}
      </Button>
    </div>
  ) : (
    <div className="relative w-full bg-gray-100 rounded-xl p-4 shadow-md">
      {/* Botón de copiar */}
      {useCase === 'generate' && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <span className="hidden sm:inline text-gray-500 text-sm">Copiar palabras</span>
          <button
            onClick={copyToClipboard}
            title="Copiar palabras"
            className="text-gray-700 hover:text-gray-900 transition-transform transform hover:scale-110"
          >
            {copied ? <FaCopy /> : <FaRegCopy />}
          </button>
        </div>
      )}

      {/* Sección de palabras en grilla responsiva */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 px-4 py-6">
        {useCase === 'generate' &&
          wordsFormatted.map((word: string, index: number) => (
            <div
              className="flex items-center gap-x-2 bg-gray-200 rounded-lg p-2 shadow-sm text-black font-semibold transition-transform transform hover:scale-105"
              key={index}
            >
              <span className="text-gray-600 text-sm">{index + 1}.</span>
              <span className="text-black">{word}</span>
            </div>
          ))}

        {useCase === 'recovery' &&
          recoveryWords.map((word: string, index: number) => (
            <div
              className={`relative flex items-center gap-x-2 border-b-2 text-base md:text-lg font-semibold rounded-lg p-2 transition-all ${
                nextRecoveryWordIndex === index ? 'bg-blue-50 border-blue-500' : 'bg-gray-100 border-gray-400'
              }`}
              key={index}
            >
              <span className="text-gray-500 text-sm">{index + 1}.</span>
              <span className="text-black">{word || 'ㅤ'}</span>
              {word !== '' && (
                <button
                  className="ml-auto text-gray-500 hover:text-gray-700"
                  onClick={() => removeRecoveryWord(index)}
                >
                  <IoCloseSharp />
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default WordsContainer;
