import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';

export const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data.categories;
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data.data.product;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        purchasePrice: productData.purchasePrice.toString(),
        sellingPrice: productData.sellingPrice.toString(),
        stockQuantity: productData.stockQuantity.toString(),
      });
      setPreview(productData.productImage);
    }
  }, [productData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEdit) {
        return await api.patch(`/products/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save product');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isEdit && !imageFile) {
      setError('Product image is required');
      return;
    }

    saveMutation.mutate();
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                <option value="">Select Category</option>
                {categories?.map((cat: any) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Purchase Price (৳)</label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} required min="0" step="0.01"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Selling Price (৳)</label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required min="0" step="0.01"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Initial Stock</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Product Image</label>
              <div className="mt-2 flex items-center gap-6">
                {preview && <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border" />}
                <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
            <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={saveMutation.isPending} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 text-sm font-semibold">
              {saveMutation.isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};