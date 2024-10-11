import { useContext, useEffect, useState } from 'react';
import Card from '../common/Card';
import LoadingOverlay from '../common/LoadingOverlay';
import { RefreshIcon } from '../icons/RefreshIcon';
import TransactionInfoCard from '../wallet/sign-transaction/TransactionInfoCard';
import {
  WalletContext,
  getDateFromTimeStamp,
  mapTransactionListInfo,
} from '@marketplaces/utils-2';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { mapAccountTxData } from '@marketplaces/utils-2/src/lib/mappers/mapTransactionInfo';
import { MessageList } from '../ui-lib';

interface TransactionsProps {
  txPerPage: number;
}

export default function Transactions(props: TransactionsProps) {
  const { txPerPage } = props;
  const {
    walletData,
    walletID,
    walletAddress,
    fetchWalletData,
    balanceChanged,
  } = useContext<any>(WalletContext);
  const [transactionsList, setTransactionsList] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [paginationMetadata, setPaginationMetadata] = useState<any>({
    currentPage: 1,
    pageSize: 0,
    totalItems: 0,
  });
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    /* const pendingTx = router.query.pendingTx; */

    const pendingTx = localStorage.getItem('pendingTx');

    const currentDate = new Date();

    if (pendingTx && typeof pendingTx === 'string') {
      const { data, timestamp } = JSON.parse(pendingTx);

      if (Date.now() - timestamp > 300000) {
        // Eliminar pendingTx despues de 5 min
        localStorage.removeItem('pendingTx');
        setPendingTransaction(null);
        return;
      }

      setPendingTransaction((prevState: any) => {
        return {
          ...data,
          title: 'Envio de fondos',
          subtitle: getDateFromTimeStamp(currentDate.getTime() / 1000),
          tx_type: 'sent',
          tx_status: 'pending',
          tx_confirmation_status: 'LOW',
          tx_confirmation_n: 0,
        };
      });
    }
  }, [router.query]);
  useEffect(() => {
    if (walletAddress) {
      getTransactionsData(1, false);
    }
  }, [router, walletAddress]);

  useEffect(() => {
    const clearAllCaches = () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('/api/transactions/address-tx')) {
          localStorage.removeItem(key);
        }
      });
    };
    

    if (balanceChanged !== 0) {
      // Limpiar todas las caches
      clearAllCaches();

      // Traer datos de tabla
      getTransactionsData(1, true);
    }
  }, [balanceChanged]);

  const fetchWithCache = async (
    url: string,
    payload: any,
    invalidateCache: boolean = false
  ) => {
    const cacheKey = `${url}-${JSON.stringify(payload)}`;

    if (!invalidateCache) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 60 * 60 * 1000 && !data?.error) {
          // Invalida después de 1 hora
          return data;
        }
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );

    return data;
  };

  const getTransactionsData = async (
    page: number = 1,
    invalidateCache: boolean = false
  ) => {
    setIsLoading(true);

    const payload = {
      address: walletAddress,
      page_number: page,
      limit: txPerPage,
    };
    console.log(payload);

    const responseData = await fetchWithCache(
      '/api/transactions/address-tx',
      payload,
      invalidateCache
    );

    if (responseData?.error) {
      toast.error('Hubo un error sincronizando el historial de transacciones');
      return;
    }

    if (pendingTransaction) {
      const isPendingTxOk = responseData?.find(
        (tx: any) => tx.hash === pendingTransaction.tx_id
      );

      if (isPendingTxOk) {
        localStorage.removeItem('pendingTx');
        setPendingTransaction(null);
      }
    }

    const paginationMetadataItem = {
      currentPage: page,
      pageSize: 0,
      totalItems: 0,
    };

    console.log('responseData', responseData);
    const mappedTransactionListData = await mapAccountTxData({
      walletAddress: walletData?.address,
      data: responseData,
    });

    console.log('mappedTransactionListData', mappedTransactionListData);

    //getPendingTransaction(mappedTransactionListData);
    setTransactionsList(mappedTransactionListData);
    setPaginationMetadata(paginationMetadataItem);
    setIsLoading(false);
  };

  /* const checkTxConfirmations = async () => {
    if (pendingTransaction) {
      const pendingTransactionItemRequest = await fetch(
        '/api/helpers/tx-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pendingTransaction.tx_id),
        }
      );
      const responseData = await pendingTransactionItemRequest.json();

      if (responseData) {
        const newStatePendingTransaction = {
          ...pendingTransaction,
          tx_status:
            responseData[0].num_confirmations !== null &&
            responseData[0].num_confirmations >= 1
              ? 'on-chain'
              : 'pending',
          tx_confirmation_status: 'LOW',
          tx_confirmation_n: responseData[0].num_confirmations || 0,
        };

        // Actualizar cache
        const pendingTx = localStorage.getItem('pendingTx');
        if (pendingTx && typeof pendingTx === 'string') {
          setPendingTransaction(newStatePendingTransaction);
          const parsedPendingTx = JSON.parse(pendingTx);

          localStorage.setItem(
            'pendingTx',
            JSON.stringify({
              data: newStatePendingTransaction,
              timestamp: parsedPendingTx.timestamp,
            })
          );
        }
      }
    }
  }; */

  /*   useEffect(() => {
    if (pendingTransaction) {
      setTimeout(checkTxConfirmations, 20000);
    }
  }, [pendingTransaction]); */

  // Pagination
  /* const indexOfLastItem =
    paginationMetadata.currentPage * paginationMetadata.pageSize;
  const indexOfFirstItem = indexOfLastItem - paginationMetadata.pageSize; */
  // const currentItems = transactionsList.slice(
  //   indexOfFirstItem,
  //   indexOfLastItem
  // );

  const canShowPrevious = paginationMetadata.currentPage > 1;
  const canShowNext = true;

  const changePage = async (changeValue: number) => {
    setIsLoading(true);

    await getTransactionsData(paginationMetadata.currentPage + changeValue);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchWalletData();
    setIsLoading(false);
  };
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
    <Card className={` ${colors.fuenteAlterna}  col-span-2 h-fit`}>
      <Card.Header
        title="Transacciones" className={`${colors.fuente}`}
        tooltip={
          <button
            type="button"
            className={`text-white ${colors.bgColor}  ${colors.hoverBgColor} focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 `}
            disabled={isLoading}
            onClick={() => handleRefresh()}
          >
            <RefreshIcon />
          </button>
        }
      />
      <Card.Body>
        {transactionsList.length === 0 && !isLoading && (
          <p>Aún no has realizado transacciones</p>
        )}
        <div className="space-y-2">
          {pendingTransaction && (
            <div className="space-y-2">
              <p>Transacciones pendientes</p>
              <TransactionInfoCard
                title={pendingTransaction.title}
                subtitle={pendingTransaction.subtitle}
                tx_id={pendingTransaction.tx_id}
                tx_type={pendingTransaction.tx_type}
                tx_fee={pendingTransaction.tx_fee}
                tx_value={pendingTransaction.tx_value}
                tx_assets={pendingTransaction.tx_assets}
                block={pendingTransaction.block}
                tx_size={pendingTransaction.tx_size}
                inputUTxOs={pendingTransaction.inputUTxOs}
                outputUTxOs={pendingTransaction.outputUTxOs}
                is_collapsed={true}
                metadata={pendingTransaction.metadata}
                tx_status={pendingTransaction.tx_status}
                tx_confirmation_status={
                  pendingTransaction.tx_confirmation_status
                }
              />
            </div>
          )}
          {/* <MessageList/> */}
          <p>Historial de transacciones de billetera</p>
          <LoadingOverlay visible={isLoading} className="space-y-2">
            {transactionsList &&
              transactionsList
                .filter((tx: any) => tx.tx_id !== pendingTransaction?.tx_id)
                .map((tx: any, index: number) => {
                  return (
                    <TransactionInfoCard
                      key={index}
                      title={tx.title}
                      subtitle={tx.subtitle}
                      tx_id={tx.tx_id}
                      tx_type={tx.tx_type}
                      tx_fee={tx.tx_fee}
                      tx_value={tx.tx_value}
                      tx_assets={tx.tx_assets}
                      block={tx.block}
                      tx_size={tx.tx_size}
                      inputUTxOs={tx.inputUTxOs}
                      outputUTxOs={tx.outputUTxOs}
                      is_collapsed={true}
                      metadata={tx.metadata}
                    />
                  );
                })}
          </LoadingOverlay>
          {/* <div className="relative space-y-2 min-h-20">
            {isLoading && (
              <div
                className={`absolute top-0 left-0 w-full h-full flex items-center justify-center py-10`}
              >
                <LoadingIcon className="w-10 h-10" />
              </div>
            )}
          </div> */}
        </div>

        <div className="flex flex-col items-center mt-5">
          {/* <span className="text-sm text-gray-700 dark:text-gray-400">
            Mostrando de{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {indexOfFirstItem + 1}
            </span>{' '}
            a{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min(indexOfLastItem, paginationMetadata.totalItems)}
            </span>{' '}
            de un total de{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {paginationMetadata.totalItems}
            </span>{' '}
            Transacciones
          </span> */}
          <div className="inline-flex mt-2 xs:mt-0">
            <button
              className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white ${colors.bgColor}  rounded-s ${colors.hoverBgColor} ${
                isLoading && 'cursor-progress'
              } ${!canShowPrevious && 'opacity-50 cursor-not-allowed'}`}
              onClick={() => changePage(-1)}
              disabled={!canShowPrevious || isLoading}
            >
              <>
                <svg
                  className="w-3.5 h-3.5 me-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5H1m0 0 4 4M1 5l4-4"
                  />
                </svg>
                Prev
              </>
            </button>
            <div className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white border-0 border-s border-gray-700 ${colors.bgColor}  ${colors.hoverBgColor}`}>
              {paginationMetadata.currentPage}
            </div>
            <button
              className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white ${colors.bgColor}  border-0 border-s border-gray-700 rounded-e ${colors.hoverBgColor} ${
                isLoading && 'cursor-progress'
              } ${!canShowNext && 'opacity-50 cursor-not-allowed'}`}
              onClick={() => changePage(1)}
              disabled={!canShowNext || isLoading}
            >
              Next
              <svg
                className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
