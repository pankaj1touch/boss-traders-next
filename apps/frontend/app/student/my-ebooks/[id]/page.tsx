'use client';

import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Download, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetStudentEbookByIdQuery } from '@/store/api/studentApi';
import { useDownloadEbookMutation } from '@/store/api/ebookApi';
import { addToast } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';

export default function EbookViewerPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const ebookId = params.id as string;
  
  const { data, isLoading, error } = useGetStudentEbookByIdQuery(ebookId, {
    skip: !ebookId,
  });
  
  const ebook = data?.ebook;
  const [downloadEbook, { isLoading: isDownloading }] = useDownloadEbookMutation();

  const handleDownload = async () => {
    if (!ebook?._id) return;
    
    try {
      const result = await downloadEbook(ebook._id).unwrap();
      
      // Open download URL in new tab
      window.open(result.downloadUrl, '_blank');
      
      dispatch(addToast({ 
        type: 'success', 
        message: 'Ebook download started!' 
      }));
    } catch (error: any) {
      dispatch(addToast({ 
        type: 'error', 
        message: error?.data?.message || 'Failed to download ebook' 
      }));
    }
  };

  const handleView = async () => {
    if (!ebook?._id) return;
    
    try {
      const result = await downloadEbook(ebook._id).unwrap();
      // Open in new tab for viewing
      window.open(result.downloadUrl, '_blank');
    } catch (error: any) {
      dispatch(addToast({ 
        type: 'error', 
        message: error?.data?.message || 'Failed to open ebook' 
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading ebook...</p>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Ebook Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The ebook you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push('/student/my-ebooks')}>
            Back to My Ebooks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Ebooks
          </Button>
        </div>

        {/* Ebook Card */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="relative h-64 w-48 flex-shrink-0 rounded-xl overflow-hidden bg-accent/40">
              {ebook.cover ? (
                <Image
                  src={ebook.cover}
                  alt={ebook.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Ebook Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {ebook.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  by {ebook.author}
                </p>
              </div>

              {ebook.description && (
                <p className="text-muted-foreground line-clamp-3">
                  {ebook.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{ebook.format?.toUpperCase() || 'PDF'}</span>
                </div>
                {ebook.pages && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{ebook.pages} pages</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={handleView}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isDownloading ? 'Preparing...' : 'View Ebook'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Preparing...' : 'Download'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="rounded-xl border border-border bg-accent/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Click "View Ebook" to open the ebook in a new tab, or "Download" to save it to your device.
            {ebook.format === 'pdf' && ' PDF files can be viewed directly in your browser.'}
          </p>
        </div>
      </div>
    </div>
  );
}
