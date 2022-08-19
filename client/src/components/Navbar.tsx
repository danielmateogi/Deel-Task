export interface NavbarProps {
  onChangeProfileId: (profileId: string) => void;
  onModalOpen: () => void;
  profileId: number;
  balance: number;
}

export default function Navbar({ onChangeProfileId, profileId, onModalOpen, balance }: NavbarProps) {
  return (
    <>
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          <a
            href="#"
            className="text-white text-sm uppercase hidden lg:inline-block font-semibold"
            onClick={(e) => e.preventDefault()}
          >
            DEEL DEMO
          </a>
          <form className="md:flex flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div className="relative flex w-full flex-wrap items-stretch">
              <span className="z-10 h-full leading-snug font-normal text-center text-blueGray-300 absolute bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                <i className="fas fa-user"></i>
              </span>
              <input
                onChange={(evt) => onChangeProfileId(evt.target.value)}
                value={profileId}
                type="number"
                min={1}
                max={8}
                placeholder="Profile ID"
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          </form>
          <div className="flex items-center space-x-4 text-center">
            <img className="w-10 h-10 rounded-full" src="https://picsum.photos/id/1005/100/100" alt="" />
            <div className="font-medium text-white">
              <div className="font-bold">{balance?.toFixed(2) || 0} $</div>
              <button
                onClick={onModalOpen}
                type="button"
                className="py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
