const BASE_URL = 'https://opsnav-app-service-871399330172.us-central1.run.app/auth';

class AuthAPI {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  // Set initial password for new users
  async setPassword(token, password) {
    console.log(JSON.stringify({token,password}));
    try {
      const response = await fetch(`${this.baseUrl}/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password})
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error setting password:', error);
      throw error;
    }
  }

  // Sign in user
  async signIn(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Request password reset
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token, password) {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

   //Client Login
  async signInClient(matterNumber, password) {
  try {
    const response = await fetch("https://opsnav-app-service-871399330172.us-central1.run.app/client-view/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        matterNumber,
        password
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Client signed in successfully:", data);
    return data;
  } catch (error) {
    console.error("Client sign-in failed:", error);
    throw error;
  }
}

 

  

  // Get stored auth token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Clear stored auth token
  logout() {
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthAPI;