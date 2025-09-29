// API Service for backend communication
const BASE_URL = "http://192.168.1.5:3000/api";

class ApiService {
  // Get all reports
  static async getAllReports() {
    try {
      console.log('Attempting to fetch all reports from:', BASE_URL);
      const response = await fetch(`${BASE_URL}/reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Received data:', result);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
    return {
      id: report._id,
      title:
        report.description.length > 50
          ? report.description.substring(0, 50) + "..."
          : report.description,
      status: this.mapStatus(report.status),
      date: report.createdAt
        ? new Date(report.createdAt).toISOString().split("T")[0]
        : "",
      category: report.category,
      location:
        report.location?.address ||
        `${report.location?.latitude}, ${report.location?.longitude}`,
      description: report.description,
      fullName: report.full_name,
      nic: report.nic,
      contactNumber: report.contact_number,
      evidence: report.evidence,
      latitude: report.location?.latitude,
      longitude: report.location?.longitude,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}

export default ApiService;

export async function loginUser(username, password) {
  // Call citizen login API endpoint
  // Example:
  // return fetch('/api/auth/citizen-login', ...)
}

export async function loginPoliceman(policeId, password) {
  // Call policeman login API endpoint
  // Example:
  // return fetch('/api/auth/policeman-login', ...)
}

export async function getNotifications() {
  // Replace with your backend API endpoint
  try {
    const response = await fetch('https://your-backend-url/api/notifications');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [] };
  }
}

export async function logout() {
  // Implement logout logic here, e.g., clearing tokens, notifying backend
  console.log("User logged out");
  return { success: true };
}