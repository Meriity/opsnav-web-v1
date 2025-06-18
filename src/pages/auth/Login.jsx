import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'

function Login() {
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/images/vk_lawyers_logo.jpg" alt="VK Lawyers" className="logo" />
        <LoginForm onSubmit={handleLogin} error={error} />
      </div>
    </div>
  )
}

export default Login
