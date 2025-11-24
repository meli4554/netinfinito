// Authentication Service
const AuthService = {
  // Faz login
  async login(email, password) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      const data = await response.json();

      // Salvar usuário e token no localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verifica se o usuário está logado
  async checkAuth() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  // Faz logout
  async logout() {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  // Obter token de autenticação
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Redireciona para login se não autenticado
  async requireAuth() {
    const user = await this.checkAuth();
    if (!user) {
      window.location.href = '/';
      return null;
    }
    return user;
  }
};

// Interceptor global para adicionar token em todas as requisições
(function() {
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    const token = localStorage.getItem('authToken');

    if (token && !options.headers) {
      options.headers = {};
    }

    if (token) {
      if (options.headers instanceof Headers) {
        options.headers.append('x-auth-token', token);
      } else {
        options.headers = options.headers || {};
        options.headers['x-auth-token'] = token;
      }
    }

    return originalFetch(url, options).then(response => {
      // Se receber 401, redireciona para login
      if (response.status === 401 && !url.includes('/auth/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
      return response;
    });
  };
})();

// Utility Functions
function showAlert(message, type = 'error') {
  // Criar ou obter container de alertas
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(alertContainer);
  }

  // Criar alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    margin: 0;
  `;

  // Adicionar animação de entrada
  const style = document.createElement('style');
  if (!document.getElementById('alert-animations')) {
    style.id = 'alert-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  alertContainer.appendChild(alertDiv);

  // Remover após 5 segundos
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      alertDiv.remove();
      // Remover container se vazio
      if (alertContainer.children.length === 0) {
        alertContainer.remove();
      }
    }, 300);
  }, 5000);
}

function showLoading(button) {
  button.disabled = true;
  button.innerHTML = '<span class="loading"></span> Carregando...';
}

function hideLoading(button, text) {
  button.disabled = false;
  button.textContent = text;
}
