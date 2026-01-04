'use client';

import { useGetVideoFavoritesQuery, useToggleVideoFavoriteMutation } from '@/store/api/courseApi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import Image from 'next/image';

export default function FavoritesPage() {
  const { data, isLoading } = useGetVideoFavoritesQuery();
  const [toggleFavorite] = useToggleVideoFavoriteMutation();
  const dispatch = useAppDispatch();

  const handleRemoveFavorite = async (courseId: string, videoId: string) => {
    try {
      await toggleFavorite({ courseId, videoId }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: 'Removed from favorites',
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          type: 'error',
          message: 'Failed to remove from favorites',
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  const favorites = data?.favorites || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            Favorite Videos
          </h1>
          <p className="text-muted-foreground mt-1">
            {favorites.length} {favorites.length === 1 ? 'video' : 'videos'} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6">
                Add videos to your favorites to access them quickly
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <Card key={favorite._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/courses/${favorite.courseId.slug}/learn?video=${favorite.videoId}`}>
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                      {favorite.courseId.thumbnail ? (
                        <Image
                          src={favorite.courseId.thumbnail}
                          alt={favorite.courseId.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white opacity-80" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                      {favorite.courseId.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <Link href={`/courses/${favorite.courseId.slug}/learn?video=${favorite.videoId}`}>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(favorite.courseId._id, favorite.videoId);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}


