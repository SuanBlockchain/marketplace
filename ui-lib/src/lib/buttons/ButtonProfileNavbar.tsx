import { colorByLetter } from '@marketplaces/utils-2';
interface ButtonProfileNavbarProps {
  openModal: any;
  walletInfo: any;
  showModal: boolean;
}
const ButtonProfileNavbar = (props: ButtonProfileNavbarProps) => {
  const { openModal, walletInfo, showModal } = props;
  const walletChar = walletInfo.name.charAt(0).toUpperCase();
  return (
    <button
      onClick={() => openModal(!showModal)}
      className="h-10 flex gap-4 items-center justify-center text-sm font-normal focus:z-10 focus:outline-none text-gray-900 dark:text-white dark:border-gray-600 rounded-lg  py-8 px-4"
    >
      <div className="flex flex-col">
        <p>{walletInfo.name || ''}</p>
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