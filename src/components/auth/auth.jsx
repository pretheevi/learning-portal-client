import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth.css'
import API from '../axios/api'
import toast from 'react-hot-toast'

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'signin'

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = `/auth/${mode}`
      const response = await API.post(url, form)
      toast.success(response.data.message)

      if (mode === 'signup') {
        setMode('signin')
        setForm({ name: '', email: '', password: '' })
      } else {
        const token = response.data.data
        localStorage.setItem('token', token)
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-wrapper'>
      <div className='auth-card'>
        <h2 className='auth-title'>{isLogin ? 'Welcome back' : 'Create account'}</h2>
        <p className='auth-subtitle'>{isLogin ? 'Login to continue' : 'Register to get started'}</p>
        <form className='auth-form' onSubmit={handleSubmit}>
          {!isLogin && (
            <div className='auth-field'>
              <label className='auth-label'>Name</label>
              <input
                className='auth-input'
                type='text'
                name='name'
                placeholder='Your name'
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className='auth-field'>
            <label className='auth-label'>Email</label>
            <input
              className='auth-input'
              type='email'
              name='email'
              placeholder=''
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className='auth-field'>
            <label className='auth-label'>Password</label>
            <input
              className='auth-input'
              type='password'
              name='password'
              placeholder=''
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className='btn btn-primary' type='submit' disabled={loading}>
            {loading ? (isLogin ? 'Signing in...' : 'Registering...') : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>
        <p className='auth-switch'>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span className='auth-switch-link' onClick={() => {
            setMode(isLogin ? 'signup' : 'signin')
            setForm({ name: '', email: '', password: '' })
          }}>
            {isLogin ? ' Register' : ' Sign In'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Auth
