// features/complaints/types/complaint-types.ts
export type ComplaintStatus = 'open' | 'resolved' | 'rejected';

export interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  adminResponse: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface CreateComplaintRequest {
  paymentId?: string | null;
  subject: string;
  description: string;
}

export interface ComplaintsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Complaint[];
}

export interface CreateComplaintResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Complaint;
}
