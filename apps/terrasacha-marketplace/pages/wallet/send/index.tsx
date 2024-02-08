// pages/dashboard/index.tsx
import { WalletDashboard } from '@marketplaces/ui-lib';
import { MyPage } from '@suan//components/common/types';
import { WalletSend } from '@marketplaces/ui-lib';

const Send: MyPage = (props: any) => {
  return (
    <>
      <div className="h-auto w-full px-5 pt-6">
        <div className="p-4 border-gray-200 rounded-lg dark:border-gray-700 mt-14 ">
          <WalletSend userWalletData={props.userWalletData}/>
        </div>
      </div>
    </>
  );
};

export default Send;
Send.Layout = 'Main'; // Asigna el diseño principal (Main)


export async function getServerSideProps(context: any) {
  
  // const user = await getCurrentUser();

  // const userWalletData = await getUserWalletData(projectData);
  return {
    props: {
      userWalletData: {
        address: "",
        amount: ""
      },
    },
  };
}