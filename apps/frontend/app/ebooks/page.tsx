'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Star, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetEbooksQuery } from '@/store/api/ebookApi';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { addToast } from '@/store/slices/uiSlice';

export default function EbooksPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetEbooksQuery({ limit: 12 });

  const handleAddToCart = (ebook: any) => {
    dispatch(
      addToCart({
        id: ebook._id,
        type: 'ebook',
        title: ebook.title,
        price: ebook.salePrice || ebook.price,
        thumbnail: ebook.cover,
      })
    );
    dispatch(addToast({ type: 'success', message: 'eBook added to cart!' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-4 text-5xl font-bold">eBook Library</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Expand your knowledge with our curated collection
            </p>
          </motion.div>
        </div>
      </section>

      {/* eBooks Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : data?.ebooks.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-bold">No eBooks available</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for new additions
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {data?.ebooks.map((ebook, index) => (
                <motion.div
                  key={ebook._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full overflow-hidden">
                    <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800">
                      {ebook.cover ? (
                        <Image
                          src={ebook.cover}
                          alt={ebook.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-2 flex items-center gap-2">
                        {ebook.category && <Badge>{ebook.category}</Badge>}
                        <Badge variant="secondary">{ebook.format.toUpperCase()}</Badge>
                      </div>

                      <h3 className="mb-1 line-clamp-2 font-bold">{ebook.title}</h3>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        by {ebook.author}
                      </p>

                      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {ebook.description}
                      </p>

                      {ebook.pages && (
                        <p className="mb-3 text-xs text-gray-500">
                          {ebook.pages} pages
                        </p>
                      )}

                      <div className="mb-4 flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{ebook.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({ebook.ratingCount})</span>
                      </div>

                      <div className="mb-4">
                        {ebook.salePrice && (
                          <span className="mr-2 text-sm text-gray-500 line-through">
                            {formatPrice(ebook.price)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-primary-600">
                          {formatPrice(ebook.salePrice || ebook.price)}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleAddToCart(ebook)}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

