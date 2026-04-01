// features/complaints/services/complaint.service.ts
import { apiClient } from "~/lib/api-client";
import {
  ComplaintsResponse,
  CreateComplaintRequest,
  CreateComplaintResponse,
} from "../types/complaint-types";

class ComplaintService {
  /**
   * Fetch the list of complaints created by the current user.
   */
  async getMyComplaints(): Promise<ComplaintsResponse> {
    const response = await apiClient.get<ComplaintsResponse>(
      "/api/v1/complaints/my"
    );
    return response.data;
  }

  /**
   * Create a new complaint/dispute.
   */
  async createComplaint(
    payload: CreateComplaintRequest
  ): Promise<CreateComplaintResponse> {
    const response = await apiClient.post<CreateComplaintResponse>(
      "/api/v1/complaints",
      payload
    );
    return response.data;
  }
}

export const complaintService = new ComplaintService();
