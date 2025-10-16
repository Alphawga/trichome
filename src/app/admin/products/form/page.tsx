'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PlusIcon, TrashIcon, EyeIcon, EditIcon } from '../../../components/ui/icons';

// Temporary interfaces for migration
interface ProductForm {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  cost: number;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  status: 'Active' | 'Draft' | 'Inactive';
  featured: boolean;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  ingredients: string[];
  skinConcerns: string[];
  skinTypes: string[];
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export default function ProductFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditing = Boolean(productId);

  const [form, setForm] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    compareAtPrice: 0,
    cost: 0,
    sku: '',
    barcode: '',
    category: '',
    brand: '',
    status: 'Draft',
    featured: false,
    trackQuantity: true,
    quantity: 0,
    lowStockThreshold: 10,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    images: [],
    tags: [],
    metaTitle: '',
    metaDescription: '',
    ingredients: [],
    skinConcerns: [],
    skinTypes: []
  });

  const [activeTab, setActiveTab] = useState<'general' | 'inventory' | 'images' | 'seo' | 'attributes'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for dropdowns
  const categories = ['Cleansers', 'Moisturizers', 'Serums', 'Sunscreens', 'Treatments', 'Masks', 'Toners'];
  const brands = ['La Roche-Posay', 'CeraVe', 'Neutrogena', 'The Ordinary', 'Paula\'s Choice', 'Drunk Elephant'];
  const skinConcernOptions = ['Acne', 'Anti-aging', 'Hyperpigmentation', 'Sensitivity', 'Dryness', 'Oiliness'];
  const skinTypeOptions = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
  const commonIngredients = ['Hyaluronic Acid', 'Retinol', 'Niacinamide', 'Vitamin C', 'Salicylic Acid', 'Glycolic Acid'];

  useEffect(() => {
    if (isEditing && productId) {
      loadProduct(productId);
    }
  }, [isEditing, productId]);

  useEffect(() => {
    // Auto-generate slug from name
    if (form.name && !isEditing) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  }, [form.name, isEditing]);

  const loadProduct = async (id: string) => {
    try {
      // TODO: Load product with tRPC
      console.log('Loading product:', id);
      // Mock loading existing product
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Failed to load product:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof ProductForm] as any), [child]: type === 'number' ? parseFloat(value) || 0 : value }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayInput = (field: keyof ProductForm, value: string) => {
    if (value.trim()) {
      const array = value.split(',').map(item => item.trim()).filter(Boolean);
      setForm(prev => ({ ...prev, [field]: array }));
    }
  };

  const addImage = () => {
    const newImage: ProductImage = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/400/400`,
      alt: form.name || 'Product image',
      isPrimary: form.images.length === 0
    };
    setForm(prev => ({ ...prev, images: [...prev.images, newImage] }));
  };

  const removeImage = (id: string) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  const setPrimaryImage = (id: string) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map(img => ({ ...img, isPrimary: img.id === id }))
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (form.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!form.category) newErrors.category = 'Category is required';
    if (form.images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Save product with tRPC
      console.log('Saving product:', form);
      await new Promise(resolve => setTimeout(resolve, 1500));

      router.push('/admin/products');
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update product information' : 'Create a new product for your store'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {productQuery.isLoading && isEditing ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading product...</span>
        </div>
      ) : productQuery.error && isEditing ? (
        <div className="text-center py-20">
          <p className="text-red-600 mb-4">Error loading product</p>
          <button
            onClick={() => productQuery.refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'general', label: 'General' },
                  { key: 'inventory', label: 'Inventory' },
                  { key: 'images', label: 'Images' },
                  { key: 'seo', label: 'SEO' },
                  { key: 'attributes', label: 'Attributes' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg border p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                        errors.slug ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="product-url-slug"
                    />
                    {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Brief product description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      rows={8}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Detailed product description"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <select
                        name="brand"
                        value={form.brand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select brand</option>
                        {brands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price * (₦)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compare at Price (₦)
                      </label>
                      <input
                        type="number"
                        name="compareAtPrice"
                        value={form.compareAtPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost (₦)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={form.cost}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={form.sku}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="Stock Keeping Unit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={form.barcode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="Product barcode"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackQuantity"
                      name="trackQuantity"
                      checked={form.trackQuantity}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="trackQuantity" className="ml-2 text-sm text-gray-700">
                      Track quantity
                    </label>
                  </div>

                  {form.trackQuantity && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={form.quantity}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Low Stock Threshold
                        </label>
                        <input
                          type="number"
                          name="lowStockThreshold"
                          value={form.lowStockThreshold}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                      <p className="text-sm text-gray-600">Add images to showcase your product</p>
                    </div>
                    <button
                      type="button"
                      onClick={addImage}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <PlusIcon />
                      Add Image
                    </button>
                  </div>

                  {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {form.images.map((image) => (
                      <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                        <div className="aspect-square relative">
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(image.id)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                title="Set as primary"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                title="Remove image"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {form.images.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500 mb-4">No images added yet</p>
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Add First Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={form.metaTitle}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="SEO title for search engines"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {form.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={form.metaDescription}
                      onChange={handleInputChange}
                      maxLength={160}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Brief description for search engine results"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {form.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={form.tags.join(', ')}
                      onChange={(e) => handleArrayInput('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Separate tags with commas
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'attributes' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredients
                    </label>
                    <input
                      type="text"
                      value={form.ingredients.join(', ')}
                      onChange={(e) => handleArrayInput('ingredients', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="Hyaluronic Acid, Niacinamide, Vitamin C"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {commonIngredients.map(ingredient => (
                        <button
                          key={ingredient}
                          type="button"
                          onClick={() => {
                            if (!form.ingredients.includes(ingredient)) {
                              setForm(prev => ({
                                ...prev,
                                ingredients: [...prev.ingredients, ingredient]
                              }));
                            }
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          + {ingredient}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skin Concerns
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skinConcernOptions.map(concern => (
                        <label key={concern} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={form.skinConcerns.includes(concern)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({
                                  ...prev,
                                  skinConcerns: [...prev.skinConcerns, concern]
                                }));
                              } else {
                                setForm(prev => ({
                                  ...prev,
                                  skinConcerns: prev.skinConcerns.filter(c => c !== concern)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{concern}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skin Types
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skinTypeOptions.map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={form.skinTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({
                                  ...prev,
                                  skinTypes: [...prev.skinTypes, type]
                                }));
                              } else {
                                setForm(prev => ({
                                  ...prev,
                                  skinTypes: prev.skinTypes.filter(t => t !== type)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (grams)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={form.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions (cm)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="number"
                        name="dimensions.length"
                        value={form.dimensions.length}
                        onChange={handleInputChange}
                        placeholder="Length"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                      <input
                        type="number"
                        name="dimensions.width"
                        value={form.dimensions.width}
                        onChange={handleInputChange}
                        placeholder="Width"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                      <input
                        type="number"
                        name="dimensions.height"
                        value={form.dimensions.height}
                        onChange={handleInputChange}
                        placeholder="Height"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={ProductStatus.DRAFT}>Draft</option>
                    <option value={ProductStatus.ACTIVE}>Active</option>
                    <option value={ProductStatus.INACTIVE}>Inactive</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={form.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured product
                  </label>
                </div>
              </div>

              {form.price > 0 && form.compareAtPrice > form.price && (
                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900">Sale Price</h4>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-green-600">₦{form.price.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">₦{form.compareAtPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Save ₦{(form.compareAtPrice - form.price).toLocaleString()} ({Math.round((1 - form.price / form.compareAtPrice) * 100)}% off)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      )}
    </div>
  );
}