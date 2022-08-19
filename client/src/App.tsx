import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import './App.css';
import ContractsTable from './components/Tables/ContractsTable';
import Navbar from './components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import { depositMutationFunction, fetchApi, paymentMutationFunction } from './api';
import { Contract, Job, Profile, BestClient } from './types/api';
import JobsTable from './components/Tables/JobsTable';
import DepositModal from './components/DepositModal';
import BestClientsTable from './components/Tables/BestClientsTable';

const getDefaultProfileId = () => {
  const profileId = localStorage.getItem('profileId');
  return profileId ? +profileId : 1;
};

export interface BestClientsFormData {
  startDate: string;
  endDate: string;
  limit: number;
}

function App() {
  const [profileId, setProfileId] = useState(getDefaultProfileId());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bestClientsFormData, setBestClientsFormData] = useState({
    /** 1 week ago startDate */
    startDate: new Date(Date.now() - 3600 * 1000 * 24 * 10).toISOString(),
    endDate: new Date().toISOString(),
    limit: 2,
  });

  const queryClient = useQueryClient();

  /** Queries */
  const contracts = useQuery<Contract[], Error>(['contracts', profileId], fetchApi('/contracts'));
  const profile = useQuery<Profile, Error>(['profile', profileId], fetchApi('/profile'));
  const jobs = useQuery<Job[], Error>(['jobs', profileId], fetchApi('/jobs/unpaid'));
  const bestClients = useQuery<BestClient[], Error>(
    ['bestClients', JSON.stringify(bestClientsFormData)],
    fetchApi(
      `/admin/best-clients?start=${bestClientsFormData.startDate}&end=${bestClientsFormData.endDate}&limit=${bestClientsFormData.limit}`
    )
  );

  /** Mutations */
  const depositMutation = useMutation(depositMutationFunction, {
    onSuccess: () => {
      toast.success('Deposit successful');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const paymentMutation = useMutation(paymentMutationFunction, {
    onSuccess: () => {
      toast.success('Payment successful');
      /** We need to invalidate almost every query if a payment is made */
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });

  const handleProfileIdChange = (profileId: string) => {
    localStorage.setItem('profileId', profileId);
    setProfileId(+profileId);
  };

  useEffect(() => {
    if (profile.error) {
      toast.error((profile.error as Error).message);
    }
  }, [profile.error]);

  useEffect(() => {
    queryClient.invalidateQueries(['bestClients']);
  }, [bestClientsFormData]);

  return (
    <div className="relative bg-blueGray-100 h-full">
      <Navbar
        onChangeProfileId={handleProfileIdChange}
        profileId={profileId}
        balance={profile.data?.balance ?? 0}
        onModalOpen={() => setIsModalOpen(true)}
      />
      <div className="relative bg-lightBlue-600 pb-32 pt-32" />
      <div className="px-4 md:px-10 mx-auto w-full -m-24">
        <div className="flex flex-wrap mt-4">
          {contracts.data && profile.data ? (
            <div className="w-full mb-12 px-4">
              <ContractsTable contracts={contracts.data} profile={profile.data} />
            </div>
          ) : null}
          {jobs.data && profile.data ? (
            <div className="w-full mb-12 px-4">
              <JobsTable
                profile={profile.data}
                jobs={jobs.data}
                onJobPaymentSubmit={(jobId) => paymentMutation.mutate({ jobId })}
              />
            </div>
          ) : null}
          {bestClients.data ? (
            <div className="w-full mb-12 px-4">
              <BestClientsTable
                bestClients={bestClients.data}
                bestClientsFormData={bestClientsFormData}
                onChangeBestClientsFormData={setBestClientsFormData}
              />
            </div>
          ) : null}
        </div>
      </div>
      <DepositModal
        isModalOpen={isModalOpen}
        profileId={profileId}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(amount) => depositMutation.mutate({ amount, profileId })}
      />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
