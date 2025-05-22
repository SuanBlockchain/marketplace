import React, { useContext, useEffect, useState } from 'react';
import { EyeOffIcon } from '../icons/EyeOffIcon';
import { EyeIcon } from '../icons/EyeIcon';
import Assets from '../wallet/assets/Assets';
import ClaimTokens from '../wallet/ClaimTokens';
import Card from '../common/Card';
import CopyToClipboard from '../common/CopyToClipboard';
import ExternalLink from '../common/ExternalLink';
import Tooltip from '../common/Tooltip';
import Transactions from '../wallet/Transactions';
import { WalletContext } from '@marketplaces/utils-2';
import { useRouter } from 'next/router';
import { getCurrentUser } from 'aws-amplify/auth';
// Definir el tipo de 'token'
interface WalletDashboardProps {
  userWalletData: any;
  address: string;
  ada: number;
  img_url: string;
  // Agrega cualquier otra propiedad que tenga tu token
}

export default function WalletDashboard(props: WalletDashboardProps) {
  const { walletData } =
    useContext<any>(WalletContext);
  const [showAddress, setShowAddress] = useState<boolean>(true);

  const handleShowAddress = () => {
    setShowAddress(!showAddress);
  };

  console.log(props.userWalletData);

  const marketplaceName = process.env.NEXT_PUBLIC_MARKETPLACE_NAME || 'Marketplace';
  const marketplaceColors: Record<string, { bgColor: string; hoverBgColor: string;bgColorAlternativo:string;fuente:string;fuenteAlterna:string;}> = {
    Terrasacha: {
      bgColor: 'bg-custom-marca-boton',
      hoverBgColor: 'hover:bg-custom-marca-boton-variante',
      bgColorAlternativo: 'bg-custom-marca-boton-alterno2',
      fuente:'font-jostBold',
      fuenteAlterna:'font-jostRegular',
    },
  
    // Agrega más marketplaces y colores aquí
  };
  const colors = marketplaceColors[marketplaceName] || {
    bgColor:  'bg-custom-dark' ,
    hoverBgColor: 'hover:bg-custom-dark-hover',
    bgColorAlternativo: 'bg-amber-400',
    fuente:'font-semibold',
    fuenteAlterna:'font-medium',
  };
  return (
    <>
      <div className="flex items-center gap-3 border-b-4 border-gray-300 pb-3 mb-6 bg-gray-100 p-3 rounded-md shadow-sm">
      <span className="text-2xl">📊</span>
      <h2 className="text-2xl font-extrabold text-gray-900">Cuadro de Mando</h2>
      </div>
      <ClaimTokens />
      <div className="grid grid-cols-1 2xl:grid-cols-5 2xl:space-x-5">
        <div className="flex-col col-span-3 space-y-5">
          <Card className="h-fit">
            <Card.Header title="Cuenta" className={`${colors.fuente}`} />
            <Card.Body>
              <div className="w-full rounded-lg bg-custom-dark p-3">
                <div className="flex gap-3 items-center">
                  <div className="flex-none">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-white rounded-lg">
                      <span className="font-medium text-custom-dark">NS</span>
                    </div>
                  </div>
                  <div className="flex-1 w-64 text-white">
                    <p className="text-lg">Mi billetera</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate w-52">
                        {walletData ? walletData?.address : 'loading ...'}
                      </p>
                      <CopyToClipboard
                        iconClassName="h-5 w-5"
                        copyValue={walletData?.address}
                        tooltipLabel="Copiar !"
                      />
                      <ExternalLink
                        iconClassName="h-5 w-5"
                        tooltipLabel="Consultar en CardanoScan Preview"
                        externalURL={
                          'https://preview.cardanoscan.io/address/' +
                          walletData?.address
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl text-amber-400">
                        {showAddress ? (
                          <>
                            {walletData
                              ? parseInt(walletData?.balance) / 1000000
                              : '0'}{' '}
                            ADA
                          </>
                        ) : (
                          <>********</>
                        )}
                      </p>
                      <Tooltip
                        text={showAddress ? 'Ocultar Saldo' : 'Mostrar Saldo'}
                      >
                        <div onClick={handleShowAddress}>
                          {showAddress ? (
                            <EyeIcon className="h-6 w-6 cursor-pointer" />
                          ) : (
                            <EyeOffIcon className="h-6 w-6 cursor-pointer" />
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          <div className="h-fit">
            <Transactions txPerPage={8} />
          </div>
        </div>
        <div className="flex-col col-span-2 space-y-5 mt-5 2xl:mt-0">
          <Assets
            assetsData={walletData && walletData.assets}
            chartActive={true}
            tableActive={true}
            tableItemsPerPage={5}
          />
        </div>
      </div>
    </>
  );
}
