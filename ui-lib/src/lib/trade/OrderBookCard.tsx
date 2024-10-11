import { useEffect, useState } from 'react';
import { SearchIcon } from '../icons/SearchIcon';
import Card from '../common/Card';
import { mapBuildTransactionInfo } from '@marketplaces/utils-2';
import { LoadingIcon, SignTransactionModal } from '../ui-lib';
import { toast } from 'sonner';

interface OrderBookCardProps {
  orderList: Array<any>;
  itemsPerPage: number;
  walletId: string;
  walletAddress: string;
  spendSwapId: string;
  spendSwapAddress: string
}

export default function OrderBookCard(props: OrderBookCardProps) {
  const { orderList, walletId, walletAddress, itemsPerPage, spendSwapId, spendSwapAddress } =
    props;

  const [newTransactionBuild, setNewTransactionBuild] = useState<any>(null);
  const [signTransactionModal, setSignTransactionModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orderList.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = orderList.length;
  const canShowPrevious = currentPage > 1;
  const canShowNext = indexOfLastItem < totalItems;
  console.log('orderList', orderList);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleOpenSignTransactionModal = () => {
    setSignTransactionModal(!signTransactionModal);
  };

  const handleRemoveOrder = async (orderId: string) => {
    const actualOrder: any = orderList?.find(
      (order: any) => order.id === orderId
    );

    const unlockOracleOrderPayload = {
      order_side: 'Unlist',
      payload: {
        wallet_id: walletId,
        orderPolicyId: spendSwapId,
        utxo: {
          transaction_id: actualOrder.utxos,
          index: 0,
        },
        addresses: [
          {
            address: walletAddress,
            lovelace: 0,
            multiAsset: [
              {
                policyid: actualOrder.tokenPolicyId,
                tokens: {
                  [actualOrder.tokenName]: parseInt(actualOrder.tokenAmount),
                },
              },
            ],
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletId,
        walletAddress: walletAddress,
        productID: actualOrder.productID,
        spendSwapAddress: spendSwapAddress
      },
    };

    console.log('unlockOracleOrderPayload', unlockOracleOrderPayload);

    const response = await fetch('/api/transactions/unlock-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unlockOracleOrderPayload),
    });
    const buildTxResponse = await response.json();

    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: {},
      });

      const postDistributionPayload = {
        updateOrder: {
          id: actualOrder.id,
          statusCode: 'unlisted',
        },
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        postDistributionPayload,
        scriptId: spendSwapId,
        transaction_id: buildTxResponse.transaction_id,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error(
        'Algo ha salido mal, revisa las direcciones de billetera ...'
      );
    }
  };

  const handleBuyOrder = async (orderId: string) => {
    setLoadingStates((prevState) => ({ ...prevState, [orderId]: true }));
    
    try {
      const actualOrder: any = orderList?.find((order: any) => order.id === orderId);
      console.log('actualOrder', actualOrder);
  
      const unlockOracleOrderPayload = {
        order_side: 'Buy',
        payload: {
          wallet_id: walletId,
          orderPolicyId: spendSwapId,
          utxo: {
            transaction_id: actualOrder.utxos,
            index: 0,
          },
          addresses: [
            {
              address: walletAddress,
              lovelace: 0,
              multiAsset: [
                {
                  policyid: actualOrder.tokenPolicyId,
                  tokens: {
                    [actualOrder.tokenName]: parseInt(actualOrder.tokenAmount),
                  },
                },
              ],
            },
            {
              address: actualOrder.wallet.address,
              lovelace:
                parseInt(actualOrder.value) * parseInt(actualOrder.tokenAmount),
            },
          ],
          metadata: {},
        },
        transactionPayload: {
          walletID: walletId,
          walletAddress: walletAddress,
          productID: actualOrder.productID,
          spendSwapAddress: spendSwapAddress
        },
      };
  
      const response = await fetch('/api/transactions/unlock-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unlockOracleOrderPayload),
      });
  
      const buildTxResponse = await response.json();
  
      if (buildTxResponse?.success) {
        const mappedTransactionData = await mapBuildTransactionInfo({
          tx_type: 'preview',
          walletAddress: walletAddress,
          buildTxResponse: buildTxResponse,
          metadata: {},
        });
  
        const postDistributionPayload = {
          updateOrder: {
            id: actualOrder.id,
            statusCode: 'claimed',
            walletBuyerID: walletId
          },
        };
  
        setNewTransactionBuild({
          ...mappedTransactionData,
          postDistributionPayload,
          scriptId: spendSwapId,
          transaction_id: buildTxResponse.transaction_id,
        });
        handleOpenSignTransactionModal();
      } else {
        toast.error('Algo ha salido mal, revisa las direcciones de billetera ...');
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado');
    } finally {
      setLoadingStates((prevState) => ({ ...prevState, [orderId]: false }));
    }
  };

  /* const handleBuyOrder = async (orderId: string) => {
    const actualOrder: any = orderList?.find(
      (order: any) => order.id === orderId
    );
    console.log('actualOrder', actualOrder);
    const unlockOracleOrderPayload = {
      order_side: 'Buy',
      payload: {
        wallet_id: walletId,
        orderPolicyId: spendSwapId,
        utxo: {
          transaction_id: actualOrder.utxos,
          index: 0,
        },
        addresses: [
          {
            address: walletAddress,
            lovelace: 0,
            multiAsset: [
              {
                policyid: actualOrder.tokenPolicyId,
                tokens: {
                  [actualOrder.tokenName]: parseInt(actualOrder.tokenAmount),
                },
              },
            ],
          },
          {
            address: actualOrder.wallet.address,
            lovelace:
              parseInt(actualOrder.value) * parseInt(actualOrder.tokenAmount),
          },
        ],
        metadata: {},
      },
      transactionPayload: {
        walletID: walletId,
        walletAddress: walletAddress,
        productID: actualOrder.productID,
        spendSwapAddress: spendSwapAddress
      },
    };

    console.log('unlockOracleOrderPayload', unlockOracleOrderPayload);

    const response = await fetch('/api/transactions/unlock-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unlockOracleOrderPayload),
    });
    const buildTxResponse = await response.json();

    if (buildTxResponse?.success) {
      const mappedTransactionData = await mapBuildTransactionInfo({
        tx_type: 'preview',
        walletAddress: walletAddress,
        buildTxResponse: buildTxResponse,
        metadata: {},
      });

      const postDistributionPayload = {
        updateOrder: {
          id: actualOrder.id,
          statusCode: 'claimed',
          walletBuyerID: walletId
        },
        // createTransaction: {
        //   productID: projectInfo.projectID,
        //   stakeAddress: walletStakeID[0],
        //   policyID: simpleScriptPolicyID,
        //   addressDestination: recipientAddress,
        //   addressOrigin:
        //     'addr_test1vqkge7txl2vdw26efyv7cytjl8l6n8678kz09agc0r34pdss0xtmp', //Desde donde se envian los fondos al usuario ADRESS MASTER,
        //   amountOfTokens: parseInt(tokenAmount),
        //   fees: parseInt(feeAmount) / 1000000, //Comision,
        //   //metadataUrl: JSON.stringify(metadata),
        //   network: networkId,
        //   tokenName: projectInfo.token.tokenName,
        //   txCborhex: signedTx,
        //   txHash: txHashValue,
        //   txIn: utxos[0].input.txHash,
        //   txProcessed: true, // Si se proceso en block chain
        //   type: 'mint',
        // },
      };

      setNewTransactionBuild({
        ...mappedTransactionData,
        postDistributionPayload,
        scriptId: spendSwapId,
        transaction_id: buildTxResponse.transaction_id,
      });
      handleOpenSignTransactionModal();
    } else {
      toast.error(
        'Algo ha salido mal, revisa las direcciones de billetera ...'
      );
    }
  };
 */
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
      <Card>
        <Card.Header
            title={
                "Libro de ordenes"
            }
          tooltip={
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                <SearchIcon className="w-5 h-5" />
              </div>
              <input
                id="adas"
                type="text"
                aria-invalid="false"
                className={`${colors.fuenteAlterna}  bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5`}
                autoComplete="off"
                placeholder="Busca un activo"
                required
              />
            </div>
          }
        />
        <Card.Body>
          <div>
            {/* Encabezado de la tabla, oculto en pantallas pequeñas */}
            <div className={`hidden md:flex space-x-2 items-center px-3 py-2`}>
              <div className={`w-full text-center ${colors.fuenteAlterna} `}>Activo</div>
              <div className={`w-full text-center ${colors.fuenteAlterna} `}>Cantidad</div>
              <div className={`w-full text-center ${colors.fuenteAlterna} `}>Precio Unitario (ADA)</div>
              <div className={`w-full text-center ${colors.fuenteAlterna} `}>Total</div>
              <div className={`w-full text-center ${colors.fuenteAlterna} `}></div>
            </div>
            <div className="space-y-1">
              {currentItems &&
                currentItems.map((order: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`${colors.fuenteAlterna} flex flex-wrap justify-between items-center bg-custom-dark text-white rounded-lg px-3 py-2`}
                    >
                      <div className="w-full md:w-1/5 text-center">
                        <p className={`md:hidden text-gray-400 `}>Activo</p>
                        <p>{order.tokenName}</p>
                      </div>
                      <div className="w-full md:w-1/5 text-center">
                        <p className={`md:hidden text-gray-400   `}>Cantidad</p>
                        <p>{order.tokenAmount}</p>
                      </div>
                      <div className="w-full md:w-1/5 text-center">
                        <p className={`md:hidden text-gray-400  `}>
                          Precio Unitario (ADA)
                        </p>
                        <p>t₳ {order.value / 1000000}</p>
                      </div>
                      <div className="w-full md:w-1/5 text-center">
                        <p className={`md:hidden text-gray-400  `}>Total</p>
                        <p>t₳ {(order.value / 1000000) * order.tokenAmount}</p>
                      </div>
                      <div className={`${colors.fuenteAlterna}  w-full md:w-1/5 text-center mt-2 md:mt-0`}>
                        {order.walletID === walletId ? (
                          <button
                            type="button"
                            className={`  flex justify-center text-red-300 w-full hover:text-white border border-red-300 hover:bg-red-400 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5`}
                            onClick={() => handleRemoveOrder(order.id)}
                          >
                            {loadingStates[order.id] ? <LoadingIcon className="w-4 h-4" /> : 'Retirar'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${colors.fuente}  flex justify-center text-yellow-300 w-full hover:text-white border border-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded text-sm px-5 py-2.5`}
                            onClick={() => handleBuyOrder(order.id)}
                          >
                            {loadingStates[order.id] ? <LoadingIcon className="w-4 h-4" /> : 'Comprar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex flex-col items-center mt-5">
              <span className={`${colors.fuenteAlterna}  text-sm text-gray-700 dark:text-gray-400`}>
                Mostrando de{' '}
                <span className={`${colors.fuente}  text-gray-900 dark:text-white`}>
                  {indexOfFirstItem + 1}
                </span>{' '}
                a{' '}
                <span className={`${colors.fuente}  text-gray-900 dark:text-white`}>
                  {Math.min(indexOfLastItem, totalItems)}
                </span>{' '}
                de un total de{' '}
                <span className={`${colors.fuente}  text-gray-900 dark:text-white`}>
                  {totalItems}
                </span>{' '}
                Activos
              </span>
              <div className={`inline-flex mt-2 xs:mt-0`}>
                <button
                  className={`${colors.fuente}  flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark rounded-s hover:bg-custom-dark-hover ${
                    !canShowPrevious && 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={prevPage}
                  disabled={!canShowPrevious}
                >
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
                </button>
                <button
                  className={`${colors.fuente}  flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-custom-dark border-0 border-s border-gray-700 rounded-e hover:bg-custom-dark-hover ${
                    !canShowNext && 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={nextPage}
                  disabled={!canShowNext}
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
          </div>
        </Card.Body>
      </Card>
      <SignTransactionModal
        signTransactionModal={signTransactionModal}
        handleOpenSignTransactionModal={handleOpenSignTransactionModal}
        newTransactionBuild={newTransactionBuild}
        signType="unlockOrder"
        isCollapsed={false}
      />
    </>
  );
}
