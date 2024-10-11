'use client';

import Card from '@marketplaces/ui-lib/src/lib/common/Card';
import Image from 'next/image';

export function TokenDetailSection({
  projectName,
  tokenName,
  tokenCurrency,
  creationDate,
  availableAmount,
  tokenPriceCOP,
  tokenPriceADA,
  tokenImageUrl,
}: {
  projectName: string;
  tokenName: string;
  tokenCurrency: string;
  creationDate: string;
  availableAmount: number | null;
  tokenPriceCOP: string;
  tokenPriceADA: string;
  tokenImageUrl: string;
}) {
  return (
    <Card className="text-amber-400" bgColor="bg-custom-dark">
      <Card.Body>
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-6 sm:space-y-0">
          <img
            src={tokenImageUrl}
            alt="Imagen desde IPFS"
            className=""
            width={200}
            height={200}
          ></img>
          <div className="flex flex-col space-y-2 w-full">
            <div className="flex justify-between">
              <span>Proyecto</span>
              <span className="font-bold text-end">{projectName}</span>
            </div>
            <div className="flex justify-between">
              <span>Nombre del token</span>
              <span className="text-end">{tokenName}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha de creación</span>
              <span className="text-end">{creationDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Cantidad disponible</span>
              <span className="text-end">
                {parseFloat(String(availableAmount)).toLocaleString('es-CO')}{' '}
                Tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span>Precio unitario</span>
              <span className="font-bold text-end">
                {parseFloat(tokenPriceCOP).toLocaleString('es-CO')} {tokenCurrency}{' '}
                / tCO2eq
              </span>
            </div>
            <div className="flex justify-end">
              <span className="font-bold text-end">
                {(parseFloat(tokenPriceADA)/ 1000000).toFixed(4)} ADA{' '}
                / tCO2eq
              </span>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
