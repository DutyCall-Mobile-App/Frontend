import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://172.20.10.4:3000/api";
const FILE_BASE_URL = "http://172.20.10.4:3000"; // for file URLs

class ApiService {
  // Get JWT token from storage
  static async getToken() {
    return await AsyncStorage.getItem("token");
  }

  // Common headers with authorization
  static async getHeaders(isJson = true) {
    const token = await this.getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (isJson) headers["Content-Type"] = "application/json";
    return headers;
  }

  // Get all reports
  static async getAllReports() {
    try {
      const response = await fetch(`${BASE_URL}/reports`, {
        method: "GET",
        headers: await this.getHeaders(),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error || "Failed to fetch reports");
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  }

  // Get report by ID
  static async getReportById(reportId) {
    try {
      const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
        method: "GET",
        headers: await this.getHeaders(),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error || "Failed to fetch report");
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  }

  // Create new report (with file upload)
  static async createReport(reportData) {
    try {
      const formData = new FormData();

      // Add all keys to FormData
      Object.keys(reportData).forEach((key) => {
        if (key === "evidence") {
          reportData.evidence.forEach((file) => {
            formData.append("evidence", {
              uri: file.uri,
              name: file.name,
              type: file.type,
            });
          });
        } else if (key === "location") {
          formData.append("latitude", reportData.location.latitude);
          formData.append("longitude", reportData.location.longitude);
          formData.append("address", reportData.location.address || "");
        } else {
          formData.append(key, reportData[key]);
        }
      });

      const response = await fetch(`${BASE_URL}/reports/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error || "Failed to create report");
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  // Update report by ID
  static async updateReport(reportId, updateData) {
    try {
      const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
        method: "PUT",
        headers: await this.getHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error || "Failed to update report");
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  }

  // Delete report by ID
  static async deleteReport(reportId) {
    try {
      const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
        method: "DELETE",
        headers: await this.getHeaders(),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success) return result;
      throw new Error(result.error || "Failed to delete report");
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  }

  // Helper: Map backend status to frontend
  static mapStatus(backendStatus) {
    const statusMap = {
      Submitted: "pending",
      "Under Review": "pending",
      "In Progress": "in-progress",
      "Action Taken": "approved",
      Resolved: "approved",
    };
    return statusMap[backendStatus] || "pending";
  }

  // Helper: Format report data for frontend
  static formatReportForFrontend(report) {
    const normalizeStatus = (status) => {
      switch (status?.toLowerCase()) {
        case "submitted":
          return "Submitted";
        case "under review":
          return "Under Review";
        case "in progress":
          return "In Progress";
        case "action taken":
          return "Action Taken";
        case "resolved":
          return "Resolved";
        default:
          return status;
      }
    };

    return {
      id: report._id,
      title:
        report.description.length > 50
          ? report.description.substring(0, 50) + "..."
          : report.description,
      status: normalizeStatus(report.status),
      date: report.createdAt
        ? new Date(report.createdAt).toISOString().split("T")[0]
        : "",
      category: report.category,
      location:
        report.location?.address ||
        `${report.location?.latitude}, ${report.location?.longitude}`,
      evidence:
        report.evidence?.map((ev) => ({
          ...ev,
          fileUrl: ev.fileUrl ? ev.fileUrl.replace(/\\/g, "/") : null,
        })) || [],
      description: report.description,
      fullName: report.full_name,
      nic: report.nic,
      contactNumber: report.contact_number,
      latitude: report.location?.latitude,
      longitude: report.location?.longitude,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}

export default ApiService;
