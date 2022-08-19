import React, { useMemo } from 'react';
import { Job, Profile } from '../../types/api';
import { truncateText } from '../../utils';
import PaymentButton from '../Buttons/PaymentButton';
import Table from './Table';

export interface JobsTableProps {
  jobs: Job[];
  profile: Profile;
  onJobPaymentSubmit: (jobId: number) => void;
}

const BASE_HEADERS = ['DESCRIPTION', 'PRICE', 'CONTRACTOR ID', 'CLIENT ID'];

export default function JobsTable({ jobs, onJobPaymentSubmit, profile }: JobsTableProps) {
  const headers = useMemo(() => {
    /** If we are on a client account, we should see the last column with the payment button as well */
    return profile.type === 'client' ? [...BASE_HEADERS, ''] : BASE_HEADERS;
  }, [profile.type]);

  return (
    <Table headers={headers} title="Unpaid Jobs">
      {jobs.map((job) => (
        <tr key={job.id}>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
            {truncateText(job.description, 50)}
          </td>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
            {job.price.toFixed(2)}
          </td>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
            {job.Contract?.ContractorId}
          </td>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
            {job.Contract?.ClientId}
          </td>
          {profile.type === 'client' ? (
            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-center">
              <PaymentButton onClick={() => onJobPaymentSubmit(job.id)} />
            </td>
          ) : null}
        </tr>
      ))}
    </Table>
  );
}
