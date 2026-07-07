import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SalesHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['sales', searchTerm, page],
    queryFn: async () => {
      const response = await api.get(`/sales?searchTerm=${searchTerm}&page=${page}&limit=10`);
      return response.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>
            <p className="text-slate-500">View all completed transactions and invoices.</p>
          </div>
          <button
            onClick={() => navigate('/pos')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Go to Creat Sale
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Invoice Number..."
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
                <th className="px-6 py-4 font-semibold">Invoice No</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Items</th>
                <th className="px-6 py-4 font-semibold">Subtotal</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Sold By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">Loading sales history...</td>
                </tr>
              ) : data?.sales?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">No sales found.</td>
                </tr>
              ) : (
                data?.sales.map((sale: any) => (
                  <tr key={sale._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-indigo-600 flex items-center gap-2">
                      <FileText size={16} />
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">{new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      {sale.items.length} items
                    </td>
                    <td className="px-6 py-4">৳{sale.subTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-red-500">-৳{sale.discount.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">৳{sale.grandTotal.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">{sale.soldBy?.name}</td>
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
              disabled={!data || data.sales.length < 10}
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
