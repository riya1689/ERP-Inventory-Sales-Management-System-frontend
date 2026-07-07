import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { X, Edit2, Trash2, Check, Plus } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data.categories as Category[];
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post('/categories', { name });
    },
    onSuccess: () => {
      setNewCategory('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-search'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await api.put(`/categories/${id}`, { name });
    },
    onSuccess: () => {
      setEditingId(null);
      setEditingName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-search'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Manage Categories</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="New Category Name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCategory.trim()) {
                  createMutation.mutate(newCategory.trim());
                }
              }}
            />
            <button
              onClick={() => {
                if (newCategory.trim()) createMutation.mutate(newCategory.trim());
              }}
              disabled={createMutation.isPending || !newCategory.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {isLoading ? (
              <p className="text-center text-slate-500 py-4">Loading categories...</p>
            ) : categories?.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No categories found.</p>
            ) : (
              categories?.map((cat: any) => (
                <div key={cat._id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg group">
                  {editingId === cat._id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 mr-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editingName.trim()) {
                          updateMutation.mutate({ id: cat._id, name: editingName.trim() });
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                    />
                  ) : (
                    <span className="font-medium text-slate-700 flex-1">{cat.name}</span>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === cat._id ? (
                      <button
                        onClick={() => {
                          if (editingName.trim()) updateMutation.mutate({ id: cat._id, name: editingName.trim() });
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditingName(cat.name);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this category?')) {
                          deleteMutation.mutate(cat._id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};