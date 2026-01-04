'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useGetPageContentQuery } from '@/store/api/pageContentApi';

export default function CareersPage() {
  const { data, isLoading, isError } = useGetPageContentQuery('careers');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-12">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !data?.pageContent || !data.pageContent.isActive) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-4">Careers</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Content is being prepared. Please check back soon.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pageContent = data.pageContent;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom py-12">
        <article className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold">{pageContent.title}</h1>
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: pageContent.content }}
          />
        </article>
      </div>
      <Footer />
    </div>
  );
}

