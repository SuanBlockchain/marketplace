import { useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import SignTransaction from './SignTransaction';
import TransactionInfoCard from './TransactionInfoCard';

interface SignTransactionModalProps {
  handleOpenSignTransactionModal: (signStatus?: boolean) => void;
  signTransactionModal: boolean;
  newTransactionBuild: any;
  signType: string;
  isCollapsed?: boolean;
}

const SEARCH_TYPE = {
  ALL: 'all',
  FT: 'ft',
  NFT: 'nft',
};

export default function SignTransactionModal(props: SignTransactionModalProps) {
  const {
    handleOpenSignTransactionModal,
    signTransactionModal,
    newTransactionBuild,
    signType,
    isCollapsed = false,
  } = props;
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
      {newTransactionBuild && (
        <Modal show={signTransactionModal} size="6xl">
          <Modal.Header
            onClose={() => {
              handleOpenSignTransactionModal();
            }}
          >
            
            <span className={`${colors.fuente}  text-xl`}>Firmar Transacción</span>
          </Modal.Header>
          <Modal.Body>
            <SignTransaction
              handleOpenSignTransactionModal={handleOpenSignTransactionModal}
              pendingTx={newTransactionBuild}
              signType={signType}
            />
            <TransactionInfoCard
              title={newTransactionBuild.title}
              subtitle={newTransactionBuild.subtitle}
              tx_id={newTransactionBuild.tx_id}
              tx_type={newTransactionBuild.tx_type}
              tx_fee={newTransactionBuild.tx_fee}
              tx_value={newTransactionBuild.tx_value}
              tx_assets={newTransactionBuild.tx_assets}
              block={newTransactionBuild.block}
              tx_size={newTransactionBuild.tx_size}
              inputUTxOs={newTransactionBuild.inputUTxOs}
              outputUTxOs={newTransactionBuild.outputUTxOs}
              is_collapsed={isCollapsed}
              metadata={newTransactionBuild.metadata}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
