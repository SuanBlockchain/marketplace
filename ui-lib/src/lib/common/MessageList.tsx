import React, { useState, useEffect } from 'react';

// Definir el tipo de mensaje
interface Message {
  id: number;
  text: string;
  timeout: number;
}

const MessageList: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isFading, setIsFading] = useState<boolean>(false);

  useEffect(() => {
    const newMessages: Message[] = [
      {
        id: 1,
        text: 'Lorem ipsum es el la actualidad ha dado al texto lorem ipsum nueva popularidad.',
        timeout: 3000,
      },
      { id: 2, text: 'Este es el segundo mensaje', timeout: 5000 },
      { id: 3, text: 'Este es el tercer mensaje', timeout: 7000 },
    ];

    // Mostrar los mensajes de forma repetitiva
    const showMessagesSequentially = async () => {
      let index = 0;
      while (true) {
        await addMessageSequentially(newMessages[index]);
        index = (index + 1) % newMessages.length; // Reiniciar al primer mensaje cuando se llegue al último
      }
    };

    showMessagesSequentially();
  }, []);

  // Función para mostrar mensajes secuencialmente
  const addMessageSequentially = (message: Message) => {
    return new Promise<void>((resolve) => {
      setCurrentMessage(message);
      setIsFading(false); // Activar animación de entrada (fade in)

      setTimeout(() => {
        setIsFading(true); // Iniciar animación de salida (fade out)

        // Dar tiempo al desvanecimiento antes de ocultar el mensaje
        setTimeout(() => {
          setCurrentMessage(null);
          resolve();
        }, 500); // Duración del fade out (500 ms)
      }, message.timeout);
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Contenedor con una altura fija para mantener la estructura */}
      {currentMessage && (
        <div
          className="flex w-full justify-center items-center bg-custom-dark"
          key={currentMessage.id}
        >
          <p
            className={`text-amber-400 px-4 py-2 rounded shadow-lg animate-pulse-slow transition-opacity duration-500 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentMessage.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
