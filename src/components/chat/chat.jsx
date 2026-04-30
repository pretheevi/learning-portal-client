import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './chat.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const TYPE_CONFIG = {
  general: { label: 'General', bubbleClass: 'bubble-general' },
  success: { label: 'Success', bubbleClass: 'bubble-success' },
  warning: { label: 'Warning', bubbleClass: 'bubble-warning' },
  info:    { label: 'Info',    bubbleClass: 'bubble-info'    },
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function Chat({ messages }) {
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='chat-wrapper'>
      <div className='chat-back' onClick={() => navigate('/dashboard')}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back</span>
      </div>

      <div className='chat-container'>
        <div className='chat-header'>
          <div className='chat-header-dot' />
          <div>
            <p className='chat-header-title'>Class Announcements</p>
            <p className='chat-header-sub'>Messages from your instructor</p>
          </div>
        </div>

        <div className='chat-messages'>
          <div className='chat-system-msg'>Session started</div>
          {messages.map((msg) => {
            const config = TYPE_CONFIG[msg.type] || TYPE_CONFIG.general
            return (
              <div key={msg.announcement_id} className='chat-msg'>
                <div className='chat-msg-avatar-row'>
                  <div className='chat-avatar'>{msg.sent_by?.[0]?.toUpperCase()}</div>
                  <span className='chat-sender'>{msg.sent_by}</span>
                </div>
                <span className={`chat-type-badge badge-${msg.type}`}>{config.label}</span>
                <div className={`chat-bubble ${config.bubbleClass}`}>{msg.message}</div>
                <span className='chat-time'>{formatTime(msg.created_at)}</span>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}

export default Chat
