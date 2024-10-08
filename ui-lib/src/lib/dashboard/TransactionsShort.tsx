import { useContext, useEffect, useState } from 'react';
import Card from '../common/Card';
import LoadingOverlay from '../common/LoadingOverlay';
import { RefreshIcon } from '../icons/RefreshIcon';
import TransactionInfoCardShort from './dashboard-project/TransactionInfoCardShort';
import {
  WalletContext,
  getDateFromTimeStamp,
  mapTransactionListInfo,
} from '@marketplaces/utils-2';
import { useRouter } from 'next/router';

interface TransactionsProps {
  txPerPage: number;
}

export default function TransactionShort(props: TransactionsProps) {
  const { txPerPage } = props;
  const { walletStakeAddress, walletData, fetchWalletData } =
    useContext<any>(WalletContext);
  const [transactionsList, setTransactionsList] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [paginationMetadata, setPaginationMetadata] = useState<any>({
    currentPage: 0,
    pageSize: 0,
    totalItems: 0,
  });
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const pendingTx = router.query.pendingTx;
    const currentDate = new Date();

    if (pendingTx && typeof pendingTx === 'string') {
      setPendingTransaction((prevState: any) => {
        return {
          ...JSON.parse(pendingTx),
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

  const getTransactionsData = async (page: number = 1) => {
    setIsLoading(true);
    const payload = {
      stake: walletStakeAddress,
      skip: page * txPerPage - txPerPage,
      limit: txPerPage,
      all: false
    };
    const response = await fetch('/api/transactions/account-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    const paginationMetadataItem = {
      currentPage: responseData.current_page,
      pageSize: responseData.page_size,
      totalItems: responseData.total_count,
    };
    const mappedTransactionListData = await mapTransactionListInfo({
      walletAddress: walletData.address,
      data: responseData.data,
    });
    const filterMappedTransactionListData = mappedTransactionListData.filter(
      (transaction) =>
        transaction.outputUTxOs.some((output) =>
          output.asset_list.some(
            (asset: any) =>
              asset.policy_id ===
              '8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83'
          )
        ) ||
        transaction.inputUTxOs.some((input) =>
          input.asset_list.some(
            (asset: any) =>
              asset.policy_id ===
              '8726ae04e47a9d651336da628998eda52c7b4ab0a4f86deb90e51d83'
          )
        )
    );
    //getPendingTransaction(mappedTransactionListData);
    setTransactionsList(filterMappedTransactionListData);
    setPaginationMetadata(paginationMetadataItem);
    setIsLoading(false);
  };

  const checkTxConfirmations = async () => {
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

      if (responseData[0].num_confirmations < 12) {
        setPendingTransaction((prevState: any) => ({
          ...prevState,
          tx_status:
            responseData[0].num_confirmations !== null &&
            responseData[0].num_confirmations > 1
              ? 'on-chain'
              : 'pending',
          tx_confirmation_status: 'LOW',
          tx_confirmation_n: responseData[0].num_confirmations || 0,
        }));
      } else {
        setPendingTransaction(null);
        await getTransactionsData();
        // setTransactionsList((prevState) => [
        //   pendingTransaction,
        //   ...prevState,
        // ]);
      }
    }
  };

  useEffect(() => {
    if (walletData) {
      getTransactionsData();
    }
  }, [walletData]);

  useEffect(() => {
    if (pendingTransaction) {
      setTimeout(checkTxConfirmations, 20000);
    }
  }, [pendingTransaction]);

  // Pagination
  const indexOfLastItem =
    paginationMetadata.currentPage * paginationMetadata.pageSize;
  const indexOfFirstItem = indexOfLastItem - paginationMetadata.pageSize;
  // const currentItems = transactionsList.slice(
  //   indexOfFirstItem,
  //   indexOfLastItem
  // );

  const canShowPrevious = paginationMetadata.currentPage > 1;
  const canShowNext = indexOfLastItem < paginationMetadata.totalItems;

  const changePage = async (changeValue: number) => {
    setIsLoading(true);
    await getTransactionsData(paginationMetadata.currentPage + changeValue);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchWalletData();
    await getTransactionsData();
    setIsLoading(false);
  };
  return (
    <Card className="col-span-2 h-fit">
      <Card.Header
        title="Transacciones"
        tooltip={
          <button
            type="button"
            className="text-white bg-custom-dark hover:bg-custom-dark-hover focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded text-sm p-2.5 "
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
              <TransactionInfoCardShort
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
                tx_confirmation_n={pendingTransaction.tx_confirmation_n}
              />
            </div>
          )}
          <p>Historial de transacciones de billetera</p>
          <LoadingOverlay visible={isLoading} className="space-y-2">
            {transactionsList &&
              transactionsList
                .filter((tx: any) => tx.tx_id !== pendingTransaction?.tx_id)
                .map((tx: any, index: number) => {
                  return (
                    <TransactionInfoCardShort
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
          <span className="text-sm text-gray-700 dark:text-gray-400">
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
          </span>
          <div className="inline-flex mt-2 xs:mt-0">
            <button
              className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark rounded-s hover:bg-custom-dark-hover ${
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
            <button
              className={`flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark border-0 border-s border-gray-700 rounded-e hover:bg-custom-dark-hover ${
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
