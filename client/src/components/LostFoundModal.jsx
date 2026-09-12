import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sound';
import './LostFoundModal.css';

export default function LostFoundModal({
  pin,
  userProfile,
  theme = 'dark',
  onClose,
  onAddComment
}) {
  const [commentText, setCommentText] = useState('');

  if (!pin) return null;

  const lfData = pin.lostFoundData || {};
  const isLost = lfData.category === 'lost';
  const comments = lfData.comments || [];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    sounds.playSuccess();
    if (typeof onAddComment === 'function') {
      onAddComment(pin.id, {
        author: {
          name: userProfile?.name || 'Anonymous Student',
          avatar: userProfile?.avatar || '🎓',
          color: userProfile?.color || '#f59e0b'
        },
        text: commentText.trim()
      });
    }

    setCommentText('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="lf-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="lf-modal-card"
          data-theme={theme}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="lf-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`lf-header-badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
                {isLost ? '🔴 Lost Item' : '🟢 Found Item'}
              </span>
              {lfData.dateHappened && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  • {lfData.dateHappened}
                </span>
              )}
            </div>

            <button
              type="button"
              className="lf-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body Content */}
          <div className="lf-modal-body">
            <h3 className="lf-post-title">{pin.title}</h3>

            <div className="lf-post-author-row">
              <span>Reported by</span>
              <span className="lf-author-pill">
                <span>{pin.createdBy?.avatar || '👤'}</span>
                <span>{pin.createdBy?.name || 'Anonymous Student'}</span>
              </span>
            </div>

            {lfData.photoUrl && (
              <img
                src={lfData.photoUrl}
                alt={pin.title}
                className="lf-post-photo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <p className="lf-post-desc">
              {lfData.description || pin.description || 'No description provided.'}
            </p>

            {/* Flat Comments Thread */}
            <div className="lf-comments-heading">
              <span>💬 Campus Comments ({comments.length})</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                Instant community updates
              </span>
            </div>

            <div className="lf-comments-list">
              {comments.length === 0 ? (
                <div className="lf-no-comments">
                  No comments yet. Be the first to reply if you have seen this item or know who owns it!
                </div>
              ) : (
                comments.map((c, idx) => (
                  <div key={c.id || idx} className="lf-comment-item">
                    <div className="lf-comment-header">
                      <span className="lf-comment-author">
                        <span>{c.author?.avatar || '💬'}</span>
                        <span style={{ color: c.author?.color || '#e2e8f0' }}>
                          {c.author?.name || 'Student'}
                        </span>
                      </span>
                      <span className="lf-comment-time">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                    <p className="lf-comment-text">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Form Strip */}
          <form className="lf-comment-form" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              className="lf-comment-input"
              placeholder="Leave a comment, sighting, or contact info..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="btn-pill-primary lf-comment-submit-btn"
            >
              Post ➔
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
