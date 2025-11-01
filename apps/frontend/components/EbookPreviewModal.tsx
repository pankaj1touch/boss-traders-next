'use client';

import { useAdminGetEbookQuery } from '@/store/api/adminApi';
import { Modal } from './ui/Modal';
import { FileText, Calendar, DollarSign, Download, Star, Users, Eye } from 'lucide-react';

interface EbookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebookId: string;
}

export function EbookPreviewModal({ isOpen, onClose, ebookId }: EbookPreviewModalProps) {
  const { data, isLoading } = useAdminGetEbookQuery(ebookId, {
    skip: !isOpen,
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ebook Preview" size="xl">
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading ebook details...</p>
        </div>
      ) : data?.ebook ? (
        <div className="p-6 space-y-6">
          {/* Ebook Header */}
          <div className="flex items-start gap-6">
            {data.ebook.cover && (
              <img
                src={data.ebook.cover}
                alt={data.ebook.title}
                className="w-32 h-40 object-cover rounded-xl shadow-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">{data.ebook.title}</h3>
              <p className="text-lg text-muted-foreground mb-2">by {data.ebook.author}</p>
              <p className="text-muted-foreground mb-4">{data.ebook.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {data.ebook.format.toUpperCase()}
                </div>
                {data.ebook.pages && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {data.ebook.pages} pages
                  </div>
                )}
                {data.ebook.fileSize && (
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {data.ebook.fileSize} MB
                  </div>
                )}
                {data.ebook.category && (
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      {data.ebook.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ebook Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Ebook Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium uppercase">{data.ebook.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DRM Level:</span>
                  <span className="font-medium capitalize">{data.ebook.drmLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.ebook.publishStatus === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : data.ebook.publishStatus === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {data.ebook.publishStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(data.ebook.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Stats */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground">Pricing & Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium text-lg">
                    {data.ebook.salePrice ? (
                      <div>
                        <span className="line-through text-muted-foreground">₹{data.ebook.price}</span>
                        <span className="ml-2 text-primary">₹{data.ebook.salePrice}</span>
                      </div>
                    ) : (
                      `₹${data.ebook.price}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{data.ebook.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({data.ebook.ratingCount})</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchases:</span>
                  <span className="font-medium">{data.purchaseCount || 0}</span>
                </div>
                {data.ebook.pages && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span className="font-medium">{data.ebook.pages}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {data.ebook.tags && data.ebook.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {data.ebook.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Information */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-3">File Information</h4>
            <div className="p-4 rounded-xl bg-accent/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">File URL:</span>
                <a
                  href={data.ebook.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm truncate max-w-xs"
                >
                  {data.ebook.fileUrl}
                </a>
              </div>
              {data.ebook.fileSize && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">{data.ebook.fileSize} MB</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">DRM Protection:</span>
                <span className="font-medium capitalize">{data.ebook.drmLevel}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Ebook not found</p>
        </div>
      )}
    </Modal>
  );
}









