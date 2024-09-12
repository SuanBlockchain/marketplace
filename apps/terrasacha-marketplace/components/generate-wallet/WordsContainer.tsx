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
    <div className="w-full  h-24 rounded-xl flex justify-center items-center palabras">
      <p>
        <Button
          className="relative flex items-center justify-center h-10 px-4 py-2 bg-[#0e7490] rounded-md text-sm text-white w-48"
          onClick={() => generateWords()}
        >
          {loading ? (
            <TailSpin
              width="20"
              color="#fff"
              wrapperClass="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            'Generar palabras'
          )}{' '}
        </Button>
      </p>
    </div>
  ) : (
    <div className="relative w-full palabras-bg h-auto rounded-xl">
      {useCase === 'generate' && (
        <button
          onClick={() => copyToClipboard()}
          className="absolute right-2 top-2 text-[#2e7d96]"
        >
          {copied ? <FaCopy /> : <FaRegCopy />}
        </button>
      )}
      <div className="grid grid-cols-3 gap-x-5 gap-y-4 px-8 py-8 palabras">
        {useCase === 'generate' &&
          wordsFormatted.map((word: string, index: number) => {
            return (
              <div
                className="palabra w-full relative text-center text-lg font-semibold"
                key={index}
              >
                <p className="absolute left-2 ">{index + 1}</p>
                <p>{word}</p>
              </div>
            );
          })}
        {useCase === 'recovery' &&
          recoveryWords.map((word: string, index: number) => {
            return (
              <div
                className={`w-full relative text-center border-b-2  text-lg font-semibold ${
                  nextRecoveryWordIndex === index
                    ? 'border-white'
                    : 'border-gray-400'
                }`}
                key={index}
              >
                <p
                  className={`absolute left-2 text-gray-400 ${
                    nextRecoveryWordIndex === index
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </p>
                {word !== '' && (
                  <button
                    className="absolute right-2 top-1 text-gray-400"
                    onClick={() => removeRecoveryWord(index)}
                  >
                    <IoCloseSharp />
                  </button>
                )}
                <p className="text-white">{word || 'ㅤ'}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default WordsContainer;
