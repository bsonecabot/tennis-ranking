const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async loginWithGoogle(googleData: {
    googleId: string;
    email: string;
    displayName: string;
    photoURL?: string;
  }): Promise<{ token: string; player: ApiPlayer }> {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  }

  async getMe(): Promise<ApiPlayer> {
    return this.request('/auth/me');
  }

  // Players
  async getPlayers(): Promise<ApiPlayer[]> {
    return this.request('/players');
  }

  async getPlayer(id: string): Promise<ApiPlayer> {
    return this.request(`/players/${id}`);
  }

  async searchPlayers(query: string): Promise<ApiPlayer[]> {
    return this.request(`/players/search?q=${encodeURIComponent(query)}`);
  }

  // Friends
  async getFriends(): Promise<ApiPlayer[]> {
    return this.request('/friends');
  }

  async getFriendRequests(): Promise<ApiFriendRequest[]> {
    return this.request('/friends/requests');
  }

  async sendFriendRequest(addresseeId: string): Promise<ApiFriendship> {
    return this.request('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ addresseeId }),
    });
  }

  async respondToFriendRequest(
    id: string,
    status: 'accepted' | 'rejected'
  ): Promise<ApiFriendship> {
    return this.request(`/friends/request/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async removeFriend(friendId: string): Promise<{ success: boolean }> {
    return this.request(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  // Matches
  async getMatches(): Promise<ApiMatch[]> {
    return this.request('/matches');
  }

  async getPendingMatches(): Promise<ApiMatch[]> {
    return this.request('/matches/pending');
  }

  async createMatch(data: {
    opponentId: string;
    winnerId: string;
    score: string;
  }): Promise<ApiMatch> {
    return this.request('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async respondToMatch(
    id: string,
    status: 'confirmed' | 'rejected'
  ): Promise<ApiMatch> {
    return this.request(`/matches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// API Types (from backend)
export interface ApiPlayer {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  googleId: string | null;
  elo: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFriendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ApiFriendRequest extends ApiFriendship {
  requester: ApiPlayer;
}

export interface ApiMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  score: string;
  player1EloChange: number;
  player2EloChange: number;
  status: 'pending' | 'confirmed' | 'rejected';
  reportedById: string;
  confirmedById: string | null;
  createdAt: string;
  confirmedAt: string | null;
  player1?: ApiPlayer;
  player2?: ApiPlayer;
  winner?: ApiPlayer;
}

export const api = new ApiClient();
