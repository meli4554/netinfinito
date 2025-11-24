// API Helper com autenticação automática
const API = {
  async fetch(url, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['x-auth-token'] = token;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token inválido ou expirado, redirecionar para login
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/';
        throw new Error('Sessão expirada');
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  async get(url) {
    return this.fetch(url, { method: 'GET' });
  },

  async post(url, data) {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async put(url, data) {
    return this.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(url) {
    return this.fetch(url, { method: 'DELETE' });
  }
};
