// API Service for backend communication
const BASE_URL = "http://172.20.10.4:3000/api";
const FILE_BASE_URL = "http://172.20.10.4:3000"; // no /api

class ApiService {
  // Get all reports
  static async getAllReports() {
    try {
      const response = await fetch(`${BASE_URL}/reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch reports");
      }
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
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      throw error;
    }
  }

  // Update report by ID (with JSON data)
  static async updateReport(reportId, updateData) {
    try {
      console.log("Updating report with ID:", reportId);
      console.log("Update data:", JSON.stringify(updateData, null, 2));

      const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Update failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("Update result:", result);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to update report");
      }
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
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  }

  // Create new report (already exists in report-form.jsx, but adding here for completeness)
  static async createReport(formData) {
    try {
      const response = await fetch(`${BASE_URL}/reports/create`, {
        method: "POST",
        body: formData, // FormData for file uploads
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  // Helper function to map backend status to frontend status
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

  // Helper function to format report data for frontend
  static formatReportForFrontend(report) {
    function normalizeStatus(status) {
      switch (status?.toLowerCase()) {
        case "submitted": return "Submitted";
        case "under review": return "Under Review";
        case "in progress": return "In Progress";
        case "action taken": return "Action Taken";
        case "resolved": return "Resolved";
        default: return status;
      }
    }

    return {
      id: report._id,
      title:
        report.description.length > 50
          ? report.description.substring(0, 50) + "..."
          : report.description,
      status: normalizeStatus(report.status),   // ✅ fixed
      date: report.createdAt
        ? new Date(report.createdAt).toISOString().split("T")[0]
        : "",
      category: report.category,
      location:
        report.location?.address ||
        `${report.location?.latitude}, ${report.location?.longitude}`,
      evidence: report.evidence?.map(ev => ({
        ...ev,
        fileUrl: ev.fileUrl ? ev.fileUrl.replace(/\\/g, "/") : null,
      })) || [], // ✅ only once
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
