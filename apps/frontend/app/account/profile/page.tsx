'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, ArrowLeft, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { User as UserType } from '@/store/api/authApi';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: authUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, refetch } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [formError, setFormError] = useState('');

  const user = data?.user ?? authUser;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    try {
      const payload: Partial<UserType> = { name: name.trim(), phone: phone.trim() || undefined };
      if (avatarUrl.trim()) payload.avatarUrl = avatarUrl.trim();
      const res = await updateProfile(payload).unwrap();
      dispatch(updateUser(res.user));
      dispatch(addToast({ type: 'success', message: res.message ?? 'Profile updated successfully' }));
      setIsEditing(false);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message ?? 'Failed to update profile'
        : 'Failed to update profile';
      setFormError(message);
      dispatch(addToast({ type: 'error', message }));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToastContainer />

      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/account')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Button>
            <h1 className="text-4xl font-bold">Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your account details
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
            </div>
          ) : isError ? (
            <Card className="py-12 text-center">
              <p className="mb-4 text-red-600 dark:text-red-400">Failed to load profile</p>
              <Button onClick={() => refetch()} variant="outline">
                Try again
              </Button>
            </Card>
          ) : user ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your details
                </CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        {user.avatarUrl || avatarUrl ? (
                          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={avatarUrl || user.avatarUrl || ''}
                              alt="Avatar"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-12 w-12 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-4">
                        <Input
                          label="Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                          disabled={isUpdating}
                        />
                        <Input
                          label="Email"
                          value={user.email ?? ''}
                          disabled
                          helperText="Email cannot be changed"
                        />
                        <Input
                          label="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number (optional)"
                          disabled={isUpdating}
                        />
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            Profile photo
                          </label>
                          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Upload image to S3 or paste a URL. PNG, JPG up to 5MB.
                          </p>
                          <ImageUpload
                            type="avatar"
                            value={avatarUrl}
                            onChange={setAvatarUrl}
                            disabled={isUpdating}
                          />
                        </div>
                      </div>
                    </div>
                    {formError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save changes'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          setName(user.name ?? '');
                          setPhone(user.phone ?? '');
                          setAvatarUrl(user.avatarUrl ?? '');
                          setFormError('');
                        }}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                      {user.avatarUrl ? (
                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <Image
                            src={user.avatarUrl}
                            alt={user.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p><span className="text-sm text-gray-500 dark:text-gray-400">Name</span><br /><span className="font-medium">{user.name}</span></p>
                      <p><span className="text-sm text-gray-500 dark:text-gray-400">Email</span><br /><span className="font-medium">{user.email}</span></p>
                      {user.phone && (
                        <p><span className="text-sm text-gray-500 dark:text-gray-400">Phone</span><br /><span className="font-medium">{user.phone}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
