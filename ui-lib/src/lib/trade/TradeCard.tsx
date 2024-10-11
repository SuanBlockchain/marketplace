import { useContext, useEffect, useState } from 'react';
import Card from '../common/Card';
import CreateOrderCard from '../trade/CreateOrderCard';
import OrderBookCard from '../trade/OrderBookCard';
import { WalletContext } from '@marketplaces/utils-2';
import { AssetModal, OrderHistoryCard } from '../ui-lib';

export default function TradeCard(props: any) {
  const { walletID, walletData } = useContext<any>(WalletContext);

  console.log('walletData', walletData);

  const [activeTab, setActiveTab] = useState<string>('my_orders');
  const [orderList, setOrderList] = useState<Array<any>>([]);
  const [orderHistoryList, setOrderHistoryList] = useState<Array<any> | null>(
    null
  );
  const [userOrderList, setUserOrderList] = useState<Array<any>>([]);
  const [purchaseList, setPurchaseList] = useState<Array<any>>([]);
  const [suanUserTokens, setSuanUserTokens] = useState<Array<any>>([]);
  const [spendSwapId, setSpendSwapId] = useState<string>('');
  const [spendSwapAddress, setSpendSwapAddress] = useState<string>('');

  const paginationLimit = 1;

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const getSpendSwapId = async () => {
      const request = await fetch('/api/contracts/get-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const scriptList = await request.json();

      const spendSwapId =
        scriptList.find((script: any) => script.script_type === 'spendSwap')
          ?.id || '';

      const spendSwapAddress =
        scriptList.find((script: any) => script.script_type === 'spendSwap')
          ?.testnetAddr || '';
      console.log('spendSwap', spendSwapId);

      setSpendSwapId(spendSwapId);
      setSpendSwapAddress(spendSwapAddress);
    };

    getSpendSwapId();
  }, []);

  const getOrderList = async (nextToken = '') => {
    const params = {
      walletId: '',
      paginationLimit: String(paginationLimit),
      filterByStatusCode: 'listed',
      nextToken: nextToken,
    };
    const queryParams = new URLSearchParams(params).toString();
    console.log(`/api/calls/getOrders?${queryParams}`);
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);
    const orders = await request.json();

    console.log('orders', orders);
    setOrderList(orders);
  };

  const getUserOrderList = async () => {
    const params = {
      walletId: walletID,
      paginationLimit: String(paginationLimit),
      nextToken: '',
    };
    const queryParams = new URLSearchParams(params).toString();
    console.log(`/api/calls/getOrders?${queryParams}`);
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);

    const ordersHistory = await request.json();
    setUserOrderList(ordersHistory);
  };

  const getPurchaseList = async () => {
    const params = {
      walletId: '',
      paginationLimit: String(paginationLimit),
      filterByStatusCode: 'claimed',
      nextToken: '',
    };
    const queryParams = new URLSearchParams(params).toString();
    console.log(`/api/calls/getOrders?${queryParams}`);
    const request = await fetch(`/api/calls/getOrders?${queryParams}`);

    const purchaseHistory = await request.json();
    const purchaseHistoryFiltered = purchaseHistory.filter(
      (purchase: any) => purchase.walletBuyerID === walletID
    );
    setPurchaseList(purchaseHistoryFiltered);
  };

  const getSuanTokens = async () => {
    const request = await fetch(`/api/calls/backend/listTokens`);
    const suanTokens = await request.json();

    // const filteredSuanProjectsTokenList = walletData.assets.filter((asset: any) => asset.asset_name === suanTokens)
    const filteredSuanProjectsTokenList = walletData?.assets
      .filter((item1: any) => {
        return suanTokens.some(
          (item2: any) =>
            item1.policy_id === item2.policyID &&
            item1.asset_name === item2.tokenName
        );
      })
      .map((item1: any) => {
        const match = suanTokens.find(
          (item2: any) =>
            item1.policy_id === item2.policyID &&
            item1.asset_name === item2.tokenName
        );
        return {
          ...item1,
          ...match,
        };
      });
    setSuanUserTokens(filteredSuanProjectsTokenList);
  };

  useEffect(() => {
    if (walletData) {
      getOrderList();
      getUserOrderList();
      getPurchaseList();
      getSuanTokens();
    }
  }, [walletData]);

  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-3 xl:col-span-1">
        <CreateOrderCard
          walletId={walletID}
          userAssetList={suanUserTokens}
          walletAddress={walletData?.address}
          walletStakeAddress={walletData?.stake_address}
          getOrderList={getOrderList}
          spendSwapId={spendSwapId}
          spendSwapAddress={spendSwapAddress}
        />
      </div>
      <div className="col-span-3 xl:col-span-2">
        <OrderBookCard
          walletAddress={walletData?.address}
          walletId={walletID}
          orderList={orderList}
          itemsPerPage={5}
          spendSwapId={spendSwapId}
          spendSwapAddress={spendSwapAddress}
        />
      </div>
      <div className="col-span-3">
        <OrderHistoryCard
          userOrderList={userOrderList}
          purchaseList={purchaseList}
          itemsPerPage={5}
          walletAddress={walletData?.address}
          walletId={walletID}
          spendSwapId={spendSwapId}
          spendSwapAddress={spendSwapAddress}
        />
      </div>
    </div>
  );
}
