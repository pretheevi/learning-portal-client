import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './auth.css'
import API from '../axios/api'

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const isLogin = mode === 'login'

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const url = `/auth/${mode === 'login' ? 'signin' : 'signup'}`
    const response = await API.post(url, form)
    const token = response.data.data
    localStorage.setItem('token', token)
    navigate('/dashboard')
    console.log(response.data)
  } catch (error) {
    console.log(error.response.data)
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

          <button className='btn btn-primary' type='submit'>
            {isLogin ? 'Login' : 'Register'}
          </button>

        </form>

        <p className='auth-switch'>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span className='auth-switch-link' onClick={() => {
            setMode(isLogin ? 'register' : 'login')
            setForm({ name: '', email: '', password: '' })
          }}>
            {isLogin ? ' Register' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Auth
