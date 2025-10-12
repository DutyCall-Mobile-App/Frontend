// API Service for backend communication
import AsyncStorage from '@react-native-async-storage/async-storage';
const BASE_URL = "http://10.92.81.249:3000/api";
const FILE_BASE_URL = "http://10.92.81.249:3000"; // no /api

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

  // Get officer details
  static async getOfficerDetails() {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch officer details');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching officer details:', error);
      throw error;
    }
  }

  // Get priority reports
  static async getPriorityReports() {
    try {
      const response = await fetch(`${BASE_URL}/reports/priority/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch priority reports');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch priority reports');
      }

      return result.data.map(report => ({
        id: report._id,
        title: report.description.substring(0, 50) + (report.description.length > 50 ? '...' : ''),
        location: report.location?.address || `${report.location?.latitude}, ${report.location?.longitude}`,
        createdAt: report.createdAt,
        priority: report.priority,
        status: report.status
      }));
    } catch (error) {
      console.error('Error fetching priority reports:', error);
      throw error;
    }
  }

  // Get recent reports
  static async getRecentReports() {
    try {
      const response = await fetch(`${BASE_URL}/reports/recent/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent reports');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch recent reports');
      }

      return result.data.map(report => ({
        id: report._id,
        title: report.description.substring(0, 50) + (report.description.length > 50 ? '...' : ''),
        location: report.location?.address || `${report.location?.latitude}, ${report.location?.longitude}`,
        createdAt: report.createdAt,
        priority: report.priority,
        status: report.status
      }));
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      throw error;
    }
  }

  // Get report stats
  static async getReportStats() {
    try {
      const response = await fetch(`${BASE_URL}/reports/stats/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report stats');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch report stats');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching report stats:', error);
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
      title: report.description.substring(0, 50) + (report.description.length > 50 ? '...' : ''),
      priority: report.priority || 'LOW',
      status: report.status,
      reporter: report.full_name || 'Anonymous',
      timeAgo: this.getTimeAgo(report.createdAt),
      location: report.location?.address || `${report.location?.latitude}, ${report.location?.longitude}`,
      createdAt: new Date(report.createdAt),
      icon: this.getCategoryIcon(report.category)
    };
  }

  // Helper function to get relative time
  static getTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} sec ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  // Helper function to get icon based on category
  static getCategoryIcon(category) {
    // Map category to MaterialIcons name
    const iconMap = {
      'public-safety': 'security',
      'infrastructure': 'construction',
      'environmental': 'nature',
      'civil': 'gavel',
      'community': 'people'
    };

    return iconMap[category] || 'report';
  }
}

export default ApiService;
