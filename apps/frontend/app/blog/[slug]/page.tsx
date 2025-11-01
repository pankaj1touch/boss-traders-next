'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, Heart, Share2, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetBlogBySlugQuery, useGetRelatedBlogsQuery } from '@/store/api/blogApi';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [liked, setLiked] = useState(false);

  const { data: blogData, isLoading } = useGetBlogBySlugQuery(slug);
  const { data: relatedData } = useGetRelatedBlogsQuery({ slug });

  const blog = blogData?.blog;
  const relatedBlogs = relatedData?.blogs || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Implement like functionality
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="animate-pulse">
            <div className="mb-8 h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
            <div className="mb-4 h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-4xl font-bold">Blog post not found</h1>
          <Link href="/blog">
            <Button className="mt-4">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      {/* Back Button */}
      <div className="border-b bg-gray-50 py-4 dark:bg-gray-900">
        <div className="container-custom">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Blog Post */}
      <article className="py-12">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary">
                  {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </Badge>
                {blog.featured && (
                  <Badge className="bg-yellow-500 text-white">Featured</Badge>
                )}
              </div>

              <h1 className="mb-4 text-4xl font-bold lg:text-5xl">{blog.title}</h1>

              <p className="mb-6 text-xl text-gray-600 dark:text-gray-400">{blog.excerpt}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{blog.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{blog.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{blog.views} views</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <Button
                  variant={liked ? 'default' : 'outline'}
                  onClick={handleLike}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {blog.likes + (liked ? 1 : 0)}
                </Button>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </motion.div>

            {/* Featured Image */}
            {blog.featuredImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="relative h-64 overflow-hidden rounded-2xl lg:h-96">
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <h3 className="mb-4 text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {blog.author.avatar && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        <Image
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{blog.author.name}</h3>
                      {blog.author.bio && (
                        <p className="text-gray-600 dark:text-gray-400">{blog.author.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </article>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="border-t bg-gray-50 py-12 dark:bg-gray-900">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold">Related Articles</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Continue reading with these related posts
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((relatedBlog, index) => (
                <motion.div
                  key={relatedBlog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/blog/${relatedBlog.slug}`}>
                    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                      {relatedBlog.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={relatedBlog.featuredImage}
                            alt={relatedBlog.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">
                          {relatedBlog.category.charAt(0).toUpperCase() + relatedBlog.category.slice(1)}
                        </Badge>
                        <h3 className="mb-2 line-clamp-2 font-bold group-hover:text-primary-600">
                          {relatedBlog.title}
                        </h3>
                        <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">
                          {relatedBlog.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(relatedBlog.publishedAt)}</span>
                          <span>{relatedBlog.readingTime} min read</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
