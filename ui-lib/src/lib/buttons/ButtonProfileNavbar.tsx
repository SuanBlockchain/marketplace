import { colorByLetter } from '@marketplaces/utils-2';
import { getCurrentUser } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';
import NavBarUserInfoSkeleton from '../common/skeleton/NavBarUserInfoSkeleton';
interface ButtonProfileNavbarProps {
  openModal: any;
  walletInfo: any;
  showModal: boolean;
}
const ButtonProfileNavbar = (props: ButtonProfileNavbarProps) => {
  const { openModal, walletInfo, showModal } = props;
  const walletChar = walletInfo?.name?.charAt(0)?.toUpperCase();
  const [username, setUsername] = useState<any>('')
  useEffect(() =>{
    getCurrentUser().then((data : any) =>{
      setUsername(data.username)
    })
    .catch((err) =>{
      console.log(err)
      setUsername(walletInfo.name)
    })
  },[])
  if(!walletChar) return <NavBarUserInfoSkeleton />
  return (
    <button
      onClick={() => openModal(!showModal)}
      className="h-10 flex gap-4 items-center justify-center text-sm font-normal focus:z-10 focus:outline-none rounded-lg  py-8 px-4"
    >
      <div className="flex flex-col">
        <p>{username || ''}</p>
        <p className="font-light text-xxs">
          {`${walletInfo.addr.slice(0, 9)}...${walletInfo.addr.slice(-4)}` ||
            ''}
        </p>
      </div>
      <div
        // @ts-ignore
        className={`relative ${colorByLetter[walletChar]} text-white font-normal rounded-lg w-10 h-10`}
      >
        <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {walletInfo.name.charAt(0).toUpperCase() || ''}
        </p>
      </div>
    </button>
  );
};
export default ButtonProfileNavbar;
