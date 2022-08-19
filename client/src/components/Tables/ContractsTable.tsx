import React, { useMemo } from 'react';
import { Contract, Profile } from '../../types/api';
import { otherClientType, getFullName, truncateText } from '../../utils';
import Table from './Table';

export interface ContractsTableProps {
  contracts: Contract[];
  profile: Profile;
}

const contractCompletionPercentage = (contract: Contract) => {
  const totalJobs = contract.Jobs.length || 1;
  const completedJobs = contract.Jobs.filter((job) => job.paid).length;
  return Math.round((completedJobs / totalJobs) * 100);
};

const ContractStatus = ({ contract }: { contract: Contract }) => {
  const { status } = contract;
  let statusClass = '';
  let statusText = '';
  switch (status) {
    case 'in_progress':
      statusClass = 'text-orange-500';
      statusText = 'In Progress';
      break;
    case 'new':
      statusClass = 'text-blue-500';
      statusText = 'New';
      break;
    case 'terminated':
      statusClass = 'text-red-500';
      statusText = 'Terminated';
      break;
  }

  return (
    <>
      <i className={`fas fa-circle ${statusClass} mr-2`}></i> {statusText}
    </>
  );
};

export default function ContractsTable({ contracts, profile }: ContractsTableProps) {
  const headers = useMemo(
    () => [otherClientType(profile.type), 'TERMS', 'STATUS', 'COMPLETION'],
    [profile.type]
  );

  return (
    <Table title="Contracts" headers={headers}>
      {contracts.map((contract) => (
        <tr key={contract.id}>
          <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
            <span className={'ml-3 font-bold text-blueGray-600'}>
              {getFullName(contract[otherClientType(profile.type)]!)}
            </span>
          </th>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
            {truncateText(contract.terms, 20)}
          </td>
          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
            <ContractStatus contract={contract} />
          </td>

          <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
            <div className="flex items-center">
              <span className="mr-2">{contractCompletionPercentage(contract)}%</span>
              <div className="relative w-full">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                  <div
                    style={{ width: `${contractCompletionPercentage(contract)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                  ></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}
