'use client';

import { useGetUserCertificatesQuery } from '@/store/api/courseApi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Award, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';

export default function CertificatesPage() {
  const { data, isLoading } = useGetUserCertificatesQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  const certificates = data?.certificates || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-8 w-8 text-yellow-500" />
            My Certificates
          </h1>
          <p className="text-muted-foreground mt-1">
            {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'} earned
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Certificates Yet</h2>
              <p className="text-muted-foreground mb-6">
                Complete courses to earn certificates
              </p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <Card key={certificate._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center">
                    <div className="text-center p-6 text-white">
                      <Award className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {certificate.courseId.title}
                      </h3>
                      <p className="text-sm opacity-90">Certificate of Completion</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Certificate #</span>
                        <span className="font-mono text-foreground">{certificate.certificateNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Issued</span>
                        <span className="text-foreground">
                          {format(new Date(certificate.issuedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {certificate.score !== undefined && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-semibold text-foreground">{certificate.score}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/courses/${certificate.courseId.slug || certificate.courseId._id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Course
                        </Button>
                      </Link>
                      <Link
                        href={`/certificates/${certificate._id}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
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


