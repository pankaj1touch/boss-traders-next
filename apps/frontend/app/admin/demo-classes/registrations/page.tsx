'use client';

import { useState } from 'react';
import {
  useAdminGetPendingRegistrationsQuery,
  useAdminApproveRegistrationMutation,
  useAdminRejectRegistrationMutation,
} from '@/store/api/adminApi';
import { useAdminSocket } from '@/hooks/useSocket';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Check, X, Calendar, Clock, Users, User, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function DemoClassRegistrationsPage() {
  const dispatch = useAppDispatch();
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState('pending');

  const { data, isLoading, refetch } = useAdminGetPendingRegistrationsQuery({
    status: filterPaymentStatus || undefined,
    approvalStatus: filterApprovalStatus || undefined,
  });

  // Listen to WebSocket events for new registrations
  useAdminSocket((newRegistration) => {
    // Refetch registrations when new one arrives
    refetch();
    
    dispatch(
      addToast({
        type: 'info',
        message: `New demo class registration: ${newRegistration.userName} registered for "${newRegistration.demoClassTitle}"`,
      })
    );
  });
  const [approveRegistration, { isLoading: isApproving }] = useAdminApproveRegistrationMutation();
  const [rejectRegistration, { isLoading: isRejecting }] = useAdminRejectRegistrationMutation();

  const handleApprove = async (id: string) => {
    try {
      await approveRegistration({ id, adminNotes: adminNotes || undefined }).unwrap();
      alert('Registration approved successfully!');
      setSelectedRegistration(null);
      setAdminNotes('');
      refetch();
    } catch (error: any) {
      alert(error.data?.message || 'Failed to approve registration');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this registration?')) {
      return;
    }
    try {
      await rejectRegistration({ id, adminNotes: adminNotes || undefined }).unwrap();
      alert('Registration rejected successfully!');
      setSelectedRegistration(null);
      setAdminNotes('');
      refetch();
    } catch (error: any) {
      alert(error.data?.message || 'Failed to reject registration');
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Demo Class Registrations</h1>
        <p className="text-muted-foreground mt-1">Review and approve pending demo class registrations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterApprovalStatus}
          onChange={(e) => setFilterApprovalStatus(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Approval Status</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterPaymentStatus}
          onChange={(e) => setFilterPaymentStatus(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Payment Status</option>
          <option value="pending">Payment Pending</option>
          <option value="completed">Payment Completed</option>
          <option value="failed">Payment Failed</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading registrations...</p>
        </div>
      )}

      {/* Registrations List */}
      {!isLoading && data && (
        <>
          {data.registrations.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">
                {filterApprovalStatus === 'pending' 
                  ? 'No pending registrations found' 
                  : filterApprovalStatus 
                  ? `No ${filterApprovalStatus} registrations found`
                  : 'No registrations found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.registrations.map((registration: any) => (
                <div
                  key={registration._id}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Registration Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {registration.demoClassId?.title || 'Demo Class'}
                          </h3>
                          {registration.demoClassId?.courseId && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Course: {typeof registration.demoClassId.courseId === 'object' 
                                ? registration.demoClassId.courseId.title 
                                : 'N/A'}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getApprovalStatusColor(registration.approvalStatus || 'pending')}>
                            {registration.approvalStatus || 'pending'}
                          </Badge>
                          {registration.paymentStatus && (
                            <Badge variant={getPaymentStatusColor(registration.paymentStatus)}>
                              Payment: {registration.paymentStatus}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Name:</span>
                            <span>{registration.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span>{registration.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span>
                            <span>{registration.phone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {registration.demoClassId && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Date:</span>
                                <span>
                                  {format(new Date(registration.demoClassId.scheduledAt), 'MMM dd, yyyy • hh:mm a')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Duration:</span>
                                <span>{registration.demoClassId.duration} minutes</span>
                              </div>
                              {registration.demoClassId.price > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-medium">Price:</span>
                                  <span>₹{registration.demoClassId.price}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {registration.notes && (
                        <div className="rounded-lg bg-accent/50 p-3">
                          <p className="text-sm font-medium mb-1">User Notes:</p>
                          <p className="text-sm text-muted-foreground">{registration.notes}</p>
                        </div>
                      )}

                      {registration.orderId && typeof registration.orderId === 'object' && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3">
                          <p className="text-sm font-medium mb-1">Order Details:</p>
                          <p className="text-sm text-muted-foreground">
                            Order #: {registration.orderId.orderNumber} | 
                            Amount: ₹{registration.orderId.total} | 
                            Status: {registration.orderId.status}
                          </p>
                        </div>
                      )}

                      {registration.adminNotes && (
                        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3">
                          <p className="text-sm font-medium mb-1">Admin Notes:</p>
                          <p className="text-sm text-muted-foreground">{registration.adminNotes}</p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Registered on: {format(new Date(registration.createdAt), 'MMM dd, yyyy • hh:mm a')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      {selectedRegistration === registration._id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Add admin notes (optional)"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-2"
                              onClick={() => handleApprove(registration._id)}
                              disabled={isApproving || isRejecting}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleReject(registration._id)}
                              disabled={isApproving || isRejecting}
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedRegistration(null);
                              setAdminNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setSelectedRegistration(registration._id)}
                          disabled={registration.approvalStatus === 'approved' || registration.approvalStatus === 'rejected'}
                        >
                          Review & Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

