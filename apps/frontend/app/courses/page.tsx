'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CourseCard } from '@/components/CourseCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetCoursesQuery } from '@/store/api/courseApi';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [modality, setModality] = useState('');

  const { data, isLoading } = useGetCoursesQuery({
    search,
    category: category || undefined,
    level: level || undefined,
    modality: modality || undefined,
    limit: 12,
  });

  const categories = ['programming', 'design', 'business', 'marketing', 'data-science'];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const modalities = ['live', 'recorded', 'hybrid'];

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setLevel('');
    setModality('');
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
            <h1 className="mb-4 text-5xl font-bold">Explore Courses</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find the perfect course to advance your skills
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-300 bg-white pl-12 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">All Levels</option>
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">All Modalities</option>
                {modalities.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod.charAt(0).toUpperCase() + mod.slice(1)}
                  </option>
                ))}
              </select>

              {(category || level || modality || search) && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              ))}
            </div>
          ) : data?.courses.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No courses found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  {data?.pagination.total} courses found
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {data?.courses.map((course, index) => (
                  <CourseCard key={course._id} course={course} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

