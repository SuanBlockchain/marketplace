import getActualPeriod from './generic/getActualPeriod';
import colorByLetter from './dicc';
import getTTLDate from './generic/getTTLDate';
import getDateFromTimeStamp from './generic/getDateFromTimeStamp';
import getAssetsLockedValue from './generic/getAssetsLockedValue';
import hexToText from './generic/hexToText';
import textToHex from './generic/textToHex';
import getTimeLive from './generic/getTimeLive';
import assetDifference from './generic/assetDifference';
import {
  mapBuildTransactionInfo,
  mapTransactionListInfo,
} from './mappers/mapTransactionInfo';
import { mapTransactionListDashboard } from './mappers/mapDashboardInvestor';
import { mapWalletDataDashboardInvestor } from './mappers/mapWalletDataDashboardInvestor';
import { mapDashboardProject } from './mappers/mapDashboardProject';
import WalletContext from './context/wallet-context';
import { WalletContextProvider } from './context/wallet-context';
import { useEpayco } from './hooks/useEpayco';


export {
  getActualPeriod,
  getTTLDate,
  getDateFromTimeStamp,
  getAssetsLockedValue,
  mapBuildTransactionInfo,
  mapTransactionListInfo,
  mapDashboardProject,
  mapWalletDataDashboardInvestor,
  mapTransactionListDashboard,
  hexToText,
  textToHex,
  getTimeLive,
  useEpayco,
  assetDifference,
  colorByLetter,
  WalletContext,
  WalletContextProvider,
};
