import { Modal } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { fetchApi } from '../api';
import DepositSubmitButton from './Buttons/DepositSubmitButton';
import RangeSlider from './RangeSlider';

export interface DepositModalProps {
  onClose: () => void;
  isModalOpen: boolean;
  onSubmit: (amount: number) => void;
  profileId: number;
}

export default function DepositModal({ onClose, isModalOpen, onSubmit, profileId }: DepositModalProps) {
  const [depositAmount, setDepositAmount] = useState([0]);

  const depositMax = useQuery(['depositMax', profileId], fetchApi('/balances/deposit/max'), {
    enabled: isModalOpen,
    // this is needed because otherwise the query would run even if the modal is not open
    cacheTime: 0,
  });

  useEffect(() => {
    if (depositMax.error) {
      toast.error((depositMax.error as Error).message);
    }
  }, [depositMax.error]);

  const isDisabled = useMemo(() => depositMax.isLoading || depositMax.isError, [depositMax]);

  const handleOnSubmit = () => {
    onSubmit(depositAmount[0]);
    setDepositAmount([0]);
  };

  const handleOnClose = () => {
    setDepositAmount([0]);
    onClose();
  };

  return (
    <Modal show={isModalOpen} size="md" popup={true} onClose={handleOnClose}>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Deposit Money</h3>

          <h4 className="text-center text-gray-900 font-bold text-lg">{depositAmount[0]}$</h4>

          <RangeSlider
            isDisabled={isDisabled}
            max={depositMax.data?.maxDeposit || 100}
            values={depositAmount}
            onChange={(values) => setDepositAmount(values)}
          />

          <div className="text-left pt-3">
            <DepositSubmitButton onClick={handleOnSubmit} isDisabled={isDisabled} />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
