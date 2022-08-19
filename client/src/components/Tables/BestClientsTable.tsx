import { BestClientsFormData } from '../../App';
import { BestClient } from '../../types/api';
import DatePicker from '../Inputs/DatePicker';
import Table from './Table';

export interface BestClientsProps {
  bestClients: BestClient[];
  bestClientsFormData: BestClientsFormData;
  onChangeBestClientsFormData: (bestClientsFormData: BestClientsFormData) => void;
}

const HEADERS = ['NAME', 'ID', 'AMOUNT PAID'];

export default function BestClientsTable({
  bestClients,
  bestClientsFormData,
  onChangeBestClientsFormData,
}: BestClientsProps) {
  return (
    <>
      <div className="flex justify-around items-center mx-auto max-w-lg w-full mb-8">
        <DatePicker
          label="Start Date"
          name="startDate"
          value={bestClientsFormData.startDate.slice(0, 10)}
          onChange={(startDate) =>
            onChangeBestClientsFormData({
              ...bestClientsFormData,
              startDate,
            })
          }
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={bestClientsFormData.endDate.slice(0, 10)}
          onChange={(endDate) =>
            onChangeBestClientsFormData({
              ...bestClientsFormData,
              endDate,
            })
          }
        />
        <div className="text-center">
          <label htmlFor="limit" className="block">
            Limit
          </label>
          <input
            value={bestClientsFormData.limit}
            onChange={(e) => onChangeBestClientsFormData({ ...bestClientsFormData, limit: +e.target.value })}
            type="number"
            min={1}
            name="limit"
            max={10}
            placeholder="Limit"
            className="px-3 py-2.5 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring pl-10"
          />
        </div>
      </div>
      <Table headers={HEADERS} title="Best Clients">
        {bestClients.map((client) => (
          <tr key={client.id}>
            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
              {client.fullName}
            </td>
            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
              {client.id}
            </td>
            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
              {client.paid.toFixed(2)}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
