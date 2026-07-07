import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Search, Users } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
  totalPurchases: number;
}

export const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', searchTerm, page],
    queryFn: async () => {
      const response = await api.get(`/customers?searchTerm=${searchTerm}&page=${page}&limit=10`);
      return response.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-indigo-600" />
              Customer Management
            </h1>
            <p className="text-slate-500">View customer database and their total purchase history.</p>
          </div>
        </div>

        {/* Searchbar */}
        <div className="mb-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name or Phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Data table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer Name</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">Total Purchased Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">Loading customers...</td>
                </tr>
              ) : data?.customers?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">No customers found.</td>
                </tr>
              ) : (
                data?.customers.map((customer: Customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{customer.name}</td>
                    <td className="px-6 py-4">{customer.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {customer.totalPurchases} Items
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data || data.customers.length < 10}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
