'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/utils/trpc';
import { ProductStatus } from '@prisma/client';
import { createProductSchema, type CreateProductInput } from '@/lib/dto';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

interface ProductFormSheetProps {
  productId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormSheet({ productId, open, onOpenChange, onSuccess }: ProductFormSheetProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      price: 0,
      category_id: '',
    },
  });

  const productQuery = trpc.getProductById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const categoriesQuery = trpc.getCategories.useQuery({});

  const createMutation = trpc.createProduct.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      reset();
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create product: ' + error.message);
    },
  });

  const updateMutation = trpc.updateProduct.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });

  useEffect(() => {
    if (productQuery.data) {
      const product = productQuery.data;
      setValue('name', product.name);
      setValue('slug', product.slug);
      setValue('description', product.description || '');
      setValue('short_description', product.short_description || '');
      setValue('sku', product.sku);
      setValue('barcode', product.barcode || '');
      setValue('price', Number(product.price));
      setValue('compare_price', Number(product.compare_price || 0));
      setValue('cost_price', Number(product.cost_price || 0));
      setValue('track_quantity', product.track_quantity);
      setValue('quantity', product.quantity);
      setValue('low_stock_threshold', product.low_stock_threshold);
      setValue('weight', Number(product.weight || 0));
      setValue('status', product.status);
      setValue('is_featured', product.is_featured);
      setValue('is_digital', product.is_digital);
      setValue('requires_shipping', product.requires_shipping);
      setValue('taxable', product.taxable);
      setValue('seo_title', product.seo_title || '');
      setValue('seo_description', product.seo_description || '');
      setValue('category_id', product.category_id);
    }
  }, [productQuery.data, setValue]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      if (productId) {
        await updateMutation.mutateAsync({ ...data, id: productId });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{productId ? 'Edit Product' : 'Add New Product'}</SheetTitle>
          <SheetDescription>
            {productId ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Enter product name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                {...register('slug')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="product-slug"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                {...register('sku')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="SKU123"
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₦) *
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare Price (₦)
                </label>
                <input
                  {...register('compare_price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  {...register('low_stock_threshold', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('category_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select category</option>
                {categoriesQuery.data?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value={ProductStatus.DRAFT}>Draft</option>
                <option value={ProductStatus.ACTIVE}>Active</option>
                <option value={ProductStatus.INACTIVE}>Inactive</option>
                <option value={ProductStatus.ARCHIVED}>Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                {...register('short_description')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Brief product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Detailed product description"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  {...register('is_featured')}
                  type="checkbox"
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('taxable')}
                  type="checkbox"
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Taxable</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('requires_shipping')}
                  type="checkbox"
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Requires Shipping</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading || isSubmitting ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
