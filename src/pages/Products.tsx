import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Plus, Search, Edit2, Trash2, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CategoryModal } from '../components/CategoryModal';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  productImage: string;
  totalSold: number;
}

export const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, page],
    queryFn: async () => {
      let url = `/products?searchTerm=${searchTerm}&page=${page}&limit=5`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      const response = await api.get(url);
      return response.data.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data.categories;
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        refetch();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products Inventory</h1>
            <p className="text-slate-500">Manage your products, stock, and pricing.</p>
          </div>
          <div className="flex gap-2">
            {user?.role === 'Admin' && (
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors border border-slate-300"
              >
                <List size={16} />
                Manage Categories
              </button>
            )}
            {user?.role !== 'Employee' && (
              <button
                onClick={() => navigate('/products/new')}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus size={16} />
                Add Product
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-slate-300 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories?.map((cat: any) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Image</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Purchase Price</th>
                <th className="px-6 py-4 font-semibold">Selling Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Sold</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : data?.products?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                data?.products.map((product: Product) => (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <img src={product.productImage} alt={product.name} className="h-10 w-10 rounded-md object-cover border" />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">৳{product.purchasePrice.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">৳{product.sellingPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{product.stockQuantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      {product.stockQuantity === 0 ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 whitespace-nowrap">Out of Stock</span>
                      ) : product.stockQuantity < 5 ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 whitespace-nowrap">Low Stock</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 whitespace-nowrap">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{product.totalSold || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role !== 'Employee' ? (
                        <>
                          <button onClick={() => navigate(`/products/edit/${product._id}`)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md ml-1">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
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
              disabled={!data || data.products.length < 5}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>

        </div>
        
        <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
      </div>
    </div>
  );
};