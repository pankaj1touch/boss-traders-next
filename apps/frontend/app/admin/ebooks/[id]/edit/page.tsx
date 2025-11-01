'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminGetEbookQuery, useAdminUpdateEbookMutation } from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditEbookPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading: loadingEbook } = useAdminGetEbookQuery(params.id);
  const [updateEbook, { isLoading: updating }] = useAdminUpdateEbookMutation();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    cover: '',
    description: '',
    price: '',
    salePrice: '',
    fileUrl: '',
    fileSize: '',
    pages: '',
    format: 'pdf',
    drmLevel: 'basic',
    category: '',
    tags: '',
    publishStatus: 'draft',
  });

  useEffect(() => {
    if (data?.ebook) {
      setFormData({
        title: data.ebook.title || '',
        slug: data.ebook.slug || '',
        author: data.ebook.author || '',
        cover: data.ebook.cover || '',
        description: data.ebook.description || '',
        price: String(data.ebook.price || ''),
        salePrice: data.ebook.salePrice ? String(data.ebook.salePrice) : '',
        fileUrl: data.ebook.fileUrl || '',
        fileSize: data.ebook.fileSize ? String(data.ebook.fileSize) : '',
        pages: data.ebook.pages ? String(data.ebook.pages) : '',
        format: data.ebook.format || 'pdf',
        drmLevel: data.ebook.drmLevel || 'basic',
        category: data.ebook.category || '',
        tags: data.ebook.tags?.join(', ') || '',
        publishStatus: data.ebook.publishStatus || 'draft',
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const ebookData = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        fileSize: formData.fileSize ? Number(formData.fileSize) : undefined,
        pages: formData.pages ? Number(formData.pages) : undefined,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await updateEbook({ id: params.id, data: ebookData }).unwrap();
      alert('Ebook updated successfully!');
      router.push('/admin/ebooks');
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to update ebook');
    }
  };

  if (loadingEbook) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground mt-4">Loading ebook...</p>
      </div>
    );
  }

  if (!data?.ebook) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ebook not found</p>
        <Link href="/admin/ebooks">
          <Button className="mt-4">Back to Ebooks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/ebooks">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Ebook</h1>
          <p className="text-muted-foreground mt-1">Update ebook information</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Purchases</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data.purchaseCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-2xl font-bold text-foreground mt-1 capitalize">{data.ebook.publishStatus}</p>
        </div>
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
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter ebook title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="ebook-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Author <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Enter ebook description"
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* File Details */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">File Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  File URL <span className="text-red-500">*</span>
                </label>
                <Input
                  type="url"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/ebook.pdf"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Format</label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pdf">PDF</option>
                    <option value="epub">EPUB</option>
                    <option value="mobi">MOBI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">File Size (MB)</label>
                  <Input
                    type="number"
                    name="fileSize"
                    value={formData.fileSize}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="5.2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Pages</label>
                  <Input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleChange}
                    min="0"
                    placeholder="250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">DRM Level</label>
                <select
                  name="drmLevel"
                  value={formData.drmLevel}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="none">None</option>
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="499"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sale Price (₹)</label>
                <Input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="399"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cover Image
                </label>
                <ImageUpload
                  value={formData.cover}
                  onChange={(url) => setFormData(prev => ({ ...prev, cover: url }))}
                  type="ebooks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <Input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Programming, Business, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="javascript, web-development, programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Publish Status</label>
                <select
                  name="publishStatus"
                  value={formData.publishStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={updating}>
            {updating ? 'Updating...' : 'Update Ebook'}
          </Button>
          <Link href="/admin/ebooks">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}






