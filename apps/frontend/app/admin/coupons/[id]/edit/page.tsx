'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useAdminGetCouponQuery,
  useAdminUpdateCouponMutation,
  useAdminDeleteCouponMutation,
} from '@/store/api/adminApi';
import {
  useAdminGetAllCoursesQuery,
  useAdminGetAllEbooksQuery,
  useAdminGetAllDemoClassesQuery,
} from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Trash2, X } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const id = params.id as string;

  const { data, isLoading: isLoadingData, error: dataError } = useAdminGetCouponQuery(id);
  const [updateCoupon, { isLoading: isUpdating }] = useAdminUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useAdminDeleteCouponMutation();

  // Fetch items for specific selection
  const { data: coursesData } = useAdminGetAllCoursesQuery({ limit: 1000 });
  const { data: ebooksData } = useAdminGetAllEbooksQuery({ limit: 1000 });
  const { data: demoClassesData } = useAdminGetAllDemoClassesQuery({ limit: 1000 });

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: null as number | null,
    applicableTo: 'all' as 'all' | 'courses' | 'ebooks' | 'demo-classes' | 'specific',
    specificItems: [] as string[],
    itemModel: 'Course' as 'Course' | 'Ebook' | 'DemoClass' | '',
    startDate: '',
    endDate: '',
    usageLimit: null as number | null,
    userLimit: 1,
    isActive: true,
    description: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showItemSelector, setShowItemSelector] = useState(false);

  // Load data when available
  useEffect(() => {
    if (data?.coupon) {
      const coupon = data.coupon;
      setFormData({
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        value: coupon.value || 0,
        minPurchaseAmount: coupon.minPurchaseAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || null,
        applicableTo: coupon.applicableTo || 'all',
        specificItems: coupon.specificItems?.map((id: any) => id.toString()) || [],
        itemModel: (coupon.itemModel as 'Course' | 'Ebook' | 'DemoClass' | '') || '',
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().slice(0, 16)
          : '',
        endDate: coupon.endDate
          ? new Date(coupon.endDate).toISOString().slice(0, 16)
          : '',
        usageLimit: coupon.usageLimit || null,
        userLimit: coupon.userLimit || 1,
        isActive: coupon.isActive ?? true,
        description: coupon.description || '',
      });
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      const newData: any = {
        ...prev,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : type === 'number'
            ? value === '' ? null : Number(value)
            : type === 'datetime-local'
            ? value
            : value,
      };

      // Reset specificItems when applicableTo changes
      if (name === 'applicableTo' && value !== 'specific') {
        newData.specificItems = [];
        newData.itemModel = '';
      }

      return newData;
    });
  };

  const handleAddSpecificItem = (itemId: string) => {
    if (!formData.specificItems.includes(itemId)) {
      setFormData((prev) => ({
        ...prev,
        specificItems: [...prev.specificItems, itemId],
      }));
    }
    setShowItemSelector(false);
    setSearchTerm('');
  };

  const handleRemoveSpecificItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      specificItems: prev.specificItems.filter((id) => id !== itemId),
    }));
  };

  const getItemName = (itemId: string) => {
    const course = coursesData?.courses?.find((c) => c._id === itemId);
    if (course) return course.title;

    const ebook = ebooksData?.ebooks?.find((e) => e._id === itemId);
    if (ebook) return ebook.title;

    const demoClass = demoClassesData?.demoClasses?.find((d) => d._id === itemId);
    if (demoClass) return demoClass.title;

    return itemId;
  };

  const getFilteredItems = () => {
    if (!showItemSelector) return [];

    let items: Array<{ _id: string; title: string; type: string }> = [];

    if (formData.itemModel === 'Course' && coursesData?.courses) {
      items = coursesData.courses.map((c) => ({ _id: c._id, title: c.title, type: 'Course' }));
    } else if (formData.itemModel === 'Ebook' && ebooksData?.ebooks) {
      items = ebooksData.ebooks.map((e) => ({ _id: e._id, title: e.title, type: 'Ebook' }));
    } else if (formData.itemModel === 'DemoClass' && demoClassesData?.demoClasses) {
      items = demoClassesData.demoClasses.map((d) => ({
        _id: d._id,
        title: d.title,
        type: 'DemoClass',
      }));
    }

    if (searchTerm) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items.filter((item) => !formData.specificItems.includes(item._id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a coupon code' }));
      return;
    }

    if (formData.code.length < 3 || formData.code.length > 20) {
      dispatch(addToast({ type: 'error', message: 'Coupon code must be 3-20 characters' }));
      return;
    }

    if (formData.value <= 0) {
      dispatch(addToast({ type: 'error', message: 'Discount value must be greater than 0' }));
      return;
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      dispatch(addToast({ type: 'error', message: 'Percentage discount cannot exceed 100%' }));
      return;
    }

    if (!formData.endDate) {
      dispatch(addToast({ type: 'error', message: 'End date is required' }));
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      dispatch(addToast({ type: 'error', message: 'End date must be after start date' }));
      return;
    }

    if (formData.applicableTo === 'specific') {
      if (!formData.itemModel) {
        dispatch(addToast({ type: 'error', message: 'Please select item type for specific items' }));
        return;
      }
      if (formData.specificItems.length === 0) {
        dispatch(addToast({ type: 'error', message: 'Please select at least one specific item' }));
        return;
      }
    }

    // Prepare submit data
    const submitData: any = {
      code: formData.code.toUpperCase().trim(),
      type: formData.type,
      value: formData.value,
      minPurchaseAmount: formData.minPurchaseAmount || 0,
      endDate: new Date(formData.endDate).toISOString(),
      usageLimit: formData.usageLimit || null,
      userLimit: formData.userLimit || 1,
      isActive: formData.isActive,
      applicableTo: formData.applicableTo,
    };

    if (formData.maxDiscountAmount) {
      submitData.maxDiscountAmount = formData.maxDiscountAmount;
    } else {
      submitData.maxDiscountAmount = null;
    }

    if (formData.startDate) {
      submitData.startDate = new Date(formData.startDate).toISOString();
    } else {
      submitData.startDate = null;
    }

    if (formData.description) {
      submitData.description = formData.description;
    } else {
      submitData.description = null;
    }

    if (formData.applicableTo === 'specific') {
      submitData.specificItems = formData.specificItems;
      submitData.itemModel = formData.itemModel;
    } else {
      submitData.specificItems = [];
      submitData.itemModel = null;
    }

    try {
      await updateCoupon({ id, data: submitData }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Coupon updated successfully!' }));
      router.push('/admin/coupons');
    } catch (error: any) {
      console.error('Coupon update error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update coupon';
      dispatch(addToast({ type: 'error', message: errorMessage }));
    }
  };

  const handleDelete = async () => {
    if (
      confirm('Are you sure you want to delete this coupon? This action cannot be undone.')
    ) {
      try {
        await deleteCoupon(id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Coupon deleted successfully!' }));
        router.push('/admin/coupons');
      } catch (error: any) {
        console.error('Coupon deletion error:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to delete coupon';
        dispatch(addToast({ type: 'error', message: errorMessage }));
      }
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading coupon...</p>
        </div>
      </div>
    );
  }

  if (dataError || !data?.coupon) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <p className="text-red-800 dark:text-red-200">Failed to load coupon</p>
          <Link href="/admin/coupons">
            <Button variant="outline" className="mt-4">
              Back to Coupons
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons">
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Coupon</h1>
            <p className="text-muted-foreground mt-1">Update coupon details</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="SAVE20"
                  maxLength={20}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  3-20 characters, will be converted to uppercase
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter coupon description..."
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Discount Type & Value */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Discount Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  min={0}
                  max={formData.type === 'percentage' ? 100 : undefined}
                  step={formData.type === 'percentage' ? 1 : 0.01}
                  placeholder={formData.type === 'percentage' ? '20' : '500'}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.type === 'percentage'
                    ? 'Enter percentage (0-100)'
                    : 'Enter amount in ₹'}
                </p>
              </div>

              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Maximum Discount Amount (Optional)
                  </label>
                  <Input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxDiscountAmount: e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    min={0}
                    step={0.01}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum discount cap for percentage coupons
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Purchase Amount
                </label>
                <Input
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum cart total required to use this coupon
                </p>
              </div>
            </div>
          </div>

          {/* Applicable To */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Applicability</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Applicable To <span className="text-red-500">*</span>
                </label>
                <select
                  name="applicableTo"
                  value={formData.applicableTo}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Items</option>
                  <option value="courses">Courses Only</option>
                  <option value="ebooks">eBooks Only</option>
                  <option value="demo-classes">Demo Classes Only</option>
                  <option value="specific">Specific Items</option>
                </select>
              </div>

              {formData.applicableTo === 'specific' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Item Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="itemModel"
                      value={formData.itemModel}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select type...</option>
                      <option value="Course">Course</option>
                      <option value="Ebook">Ebook</option>
                      <option value="DemoClass">Demo Class</option>
                    </select>
                  </div>

                  {formData.itemModel && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">
                          Selected Items ({formData.specificItems.length})
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowItemSelector(!showItemSelector)}
                        >
                          {showItemSelector ? 'Hide' : 'Add Items'}
                        </Button>
                      </div>

                      {formData.specificItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.specificItems.map((itemId) => (
                            <div
                              key={itemId}
                              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-accent text-foreground text-sm"
                            >
                              <span>{getItemName(itemId)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecificItem(itemId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {showItemSelector && (
                        <div className="border border-border rounded-2xl p-4 space-y-3">
                          <Input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {getFilteredItems().length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No items found
                              </p>
                            ) : (
                              getFilteredItems().map((item) => (
                                <button
                                  key={item._id}
                                  type="button"
                                  onClick={() => handleAddSpecificItem(item._id)}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                  <p className="text-sm font-medium text-foreground">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{item.type}</p>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Usage Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Total Usage Limit (Optional)
                </label>
                <Input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  min={0}
                  placeholder="Unlimited"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for unlimited uses
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Per User Limit
                </label>
                <Input
                  type="number"
                  name="userLimit"
                  value={formData.userLimit}
                  onChange={handleChange}
                  min={1}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How many times a single user can use this coupon
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Validity Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date (Optional)
                </label>
                <Input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Coupon will be active from this date
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Coupon will expire at this date
                </p>
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
              Active (coupon is usable)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Coupon'}
          </Button>
          <Link href="/admin/coupons">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

