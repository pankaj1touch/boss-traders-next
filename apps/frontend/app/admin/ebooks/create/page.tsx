'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCreateEbookMutation } from '@/store/api/adminApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import FileUpload from '@/components/ui/FileUpload';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateEbookPage() {
  const router = useRouter();
  const [createEbook, { isLoading }] = useAdminCreateEbookMutation();

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
    demoPages: 5,
    totalPages: 0,
    previewUrl: '',
    isDemoAvailable: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
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

      await createEbook(ebookData).unwrap();
      alert('Ebook created successfully!');
      router.push('/admin/ebooks');
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to create ebook');
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Create Ebook</h1>
          <p className="text-muted-foreground mt-1">Add a new ebook to the platform</p>
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
                  Ebook File <span className="text-red-500">*</span>
                </label>
                <FileUpload
                  value={formData.fileUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, fileUrl: url }))}
                  type="ebooks"
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

          {/* Demo/Preview Settings */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Demo & Preview Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Demo Pages
                  </label>
                  <Input
                    type="number"
                    name="demoPages"
                    value={formData.demoPages}
                    onChange={handleChange}
                    min="1"
                    placeholder="5"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Number of pages to show in demo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Total Pages
                  </label>
                  <Input
                    type="number"
                    name="totalPages"
                    value={formData.totalPages}
                    onChange={handleChange}
                    min="0"
                    placeholder="250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preview File URL
                </label>
                <Input
                  type="url"
                  name="previewUrl"
                  value={formData.previewUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/preview.pdf"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Separate preview file for demo
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDemoAvailable"
                  name="isDemoAvailable"
                  checked={formData.isDemoAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDemoAvailable: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isDemoAvailable" className="text-sm font-medium">
                  Enable Demo Preview
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Ebook'}
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






