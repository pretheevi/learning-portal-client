import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './profile.css'
import API from '../axios/api'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
      try {
        const response = await API.get('/dashboard/profile')
        setUser(response.data.data)
      } catch (err) {
        console.log(err.response?.data)
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if(!token) { navigate('/'); return; }
    fetchProfile()
  }, [])

  const getInitials = (name) => name ? name[0].toUpperCase() : '?'
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className='profile-wrapper'>
        <div className='profile-skeleton'>
          <div className='skeleton skeleton-avatar' />
          <div className='skeleton skeleton-text-lg' />
          <div className='skeleton skeleton-text-sm' />
          <div className='skeleton skeleton-text-sm' />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='profile-wrapper'>
        <p className='profile-error'>Failed to load profile.</p>
      </div>
    )
  }

  const { quiz = {}, coding = {} } = user.stats || {}

  return (
    <div className='profile-wrapper'>
      <div className='profile-back' onClick={() => navigate('/dashboard')}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back</span>
      </div>

      <div className='profile-layout'>
        {/* ── Left: Profile Card ── */}
        <div className='profile-card'>
          <div className='profile-avatar-ring'>
            <div className='profile-avatar'>
              {user.avatar
                ? <img src={user.avatar} alt='avatar' />
                : <span>{getInitials(user.name)}</span>
              }
            </div>
          </div>

          <div className='profile-info'>
            <h2 className='profile-name'>{user.name}</h2>
            <span className='profile-badge'>Student</span>
          </div>

          {user.bio && <p className='profile-bio'>{user.bio}</p>}

          <div className='profile-divider' />

          <div className='profile-details'>
            <div className='profile-detail-row'>
              <span className='profile-detail-label'>Email</span>
              <span className='profile-detail-value'>{user.email}</span>
            </div>
            <div className='profile-detail-row'>
              <span className='profile-detail-label'>Student ID</span>
              <span className='profile-detail-value profile-detail-id'>{user.student_id.slice(0, 8)}...</span>
            </div>
            <div className='profile-detail-row'>
              <span className='profile-detail-label'>Joined</span>
              <span className='profile-detail-value'>{formatDate(user.created_at)}</span>
            </div>
          </div>

          <div className='profile-divider' />

          <div className='profile-actions'>
            <button className='btn btn-primary'>Edit Profile</button>
            <button className='btn btn-secondary'>Change Password</button>
          </div>
        </div>

        {/* ── Right: Stats Card ── */}
        <div className='profile-stats-card'>
          {/* Quiz Stats */}
          <div className='stats-section'>
            <h3 className='stats-section-title'>Quiz</h3>
            {Object.keys(quiz).length === 0
              ? <p className='stats-empty'>No quiz attempts yet</p>
              : Object.entries(quiz).map(([skill, data]) => (
                <div key={skill} className='stats-row'>
                  <div className='stats-row-top'>
                    <span className='stats-skill'>{skill}</span>
                    <span className='stats-pct'>{data.percentage}%</span>
                  </div>
                  <div className='stats-bar'>
                    <div
                      className='stats-bar-fill'
                      style={{
                        width: `${data.percentage}%`,
                        background: data.percentage >= 80
                          ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                          : data.percentage >= 50
                            ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                            : 'linear-gradient(90deg, #dc2626, #f87171)'
                      }}
                    />
                  </div>
                  <span className='stats-earned'>{data.earned} / {data.possible} pts</span>
                </div>
              ))
            }
          </div>

          <div className='profile-divider' />

          {/* Coding Stats */}
          <div className='stats-section'>
            <h3 className='stats-section-title'>Coding</h3>
            {Object.keys(coding).length === 0
              ? <p className='stats-empty'>No coding attempts yet</p>
              : Object.entries(coding).map(([skill, data]) => (
                <div key={skill} className='stats-row'>
                  <div className='stats-row-top'>
                    <span className='stats-skill'>{skill}</span>
                    <span className='stats-pct'>{data.percentage}%</span>
                  </div>
                  <div className='stats-bar'>
                    <div
                      className='stats-bar-fill'
                      style={{
                        width: `${data.percentage}%`,
                        background: data.percentage >= 80
                          ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                          : data.percentage >= 50
                            ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                            : 'linear-gradient(90deg, #dc2626, #f87171)'
                      }}
                    />
                  </div>
                  <span className='stats-earned'>{data.earned} / {data.possible} pts</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
