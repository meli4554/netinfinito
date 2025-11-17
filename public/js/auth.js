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
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Verifica se o usuário está logado
  async checkAuth() {
    try {
      const response = await fetch('/auth/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      return user;
    } catch (error) {
      return null;
    }
  },

  // Faz logout
  async logout() {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
