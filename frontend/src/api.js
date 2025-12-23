const API_BASE = 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('travel_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Chat
  async getChatHistory() {
    return this.request('/chat/history');
  }

  async sendMessage(message) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async clearChatHistory() {
    return this.request('/chat/history', { method: 'DELETE' });
  }

  // Places
  async getPlaces(category = null, search = null) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/places${query}`);
  }

  async getPlace(placeId) {
    return this.request(`/places/${placeId}`);
  }

  // Reviews
  async getReviews(placeId = null) {
    const query = placeId ? `?place_id=${placeId}` : '';
    return this.request(`/reviews${query}`);
  }

  async createReview(placeId, rating, text) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ place_id: placeId, rating, text }),
    });
  }

  async reportReview(reviewId, reason) {
    return this.request(`/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Moderation
  async getModerationStats() {
    return this.request('/moderation/stats');
  }

  async getModerationQueue() {
    return this.request('/moderation/queue');
  }

  async moderateReview(reviewId, action) {
    return this.request(`/moderation/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  async getReports() {
    return this.request('/moderation/reports');
  }

  async handleReport(reportId, action) {
    return this.request(`/moderation/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  async getUsers() {
    return this.request('/moderation/users');
  }

  async changeUserRole(userId, role) {
    return this.request(`/moderation/users/${userId}/role?role=${role}`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiClient();
export default api;
