const BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

class AuthAPI {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  async setPassword(token, password) {
    const response = await fetch(`${this.baseUrl}/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    return data;
  }

async signIn(email, password) {
  const response = await fetch(`${this.baseUrl}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log("Full login response:", data); // <-- Check this in browser console

  if (!response.ok) {
    throw new Error(
      data.message || data.error || data.detail || "Login failed"
    );
  }

  return data;
}
  

  async forgotPassword(email) {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    return data;
  }

  async resetPassword(token, password) {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    return data;
  }

  async signInClient(matterNumber, password) {
    try {
      const response = await fetch(
        "https://opsnav-app-service-871399330172.us-central1.run.app/client-view/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matterNumber,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.message);
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
    return localStorage.getItem("authToken");
  }

  // Clear stored auth token
  logout() {
    localStorage.removeItem("authToken");
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthAPI;
