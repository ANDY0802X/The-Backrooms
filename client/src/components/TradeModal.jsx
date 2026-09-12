import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/sound';
import './TradeModal.css';

export default function TradeModal({
  pin,
  userProfile,
  theme = 'dark',
  onClose,
  onAddComment,
  onJoinRoom
}) {
  const [commentText, setCommentText] = useState('');
  const [offerText, setOfferText] = useState('');

  if (!pin) return null;

  const marketData = pin.marketData || {};
  const listingType = (marketData.listingType || 'sell').toUpperCase();
  const price = marketData.price || '$0';
  const condition = marketData.condition || 'Good';
  const comments = marketData.comments || [];

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    sounds.playSuccess();
    if (typeof onAddComment === 'function') {
      onAddComment(pin.id, {
        author: {
          name: userProfile?.name || 'Anonymous Student',
          avatar: userProfile?.avatar || '🎓',
          color: userProfile?.color || '#10b981'
        },
        text: commentText.trim(),
        offer: offerText.trim() || null
      });
    }

    setCommentText('');
    setOfferText('');
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

  const getTypeBadgeClass = (type) => {
    if (type === 'RENT') return 'badge-type-rent';
    if (type === 'TRADE') return 'badge-type-trade';
    return 'badge-type-sell';
  };

  return (
    <AnimatePresence>
      <motion.div
        className="trade-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="trade-modal-card"
          data-theme={theme}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="trade-modal-header">
            <div className="trade-header-meta">
              <span className={`trade-type-badge ${getTypeBadgeClass(listingType)}`}>
                {listingType === 'TRADE' ? '🔄 TRADE / SWAP' : listingType === 'RENT' ? '📅 FOR RENT' : '🏷️ FOR SALE'}
              </span>
              <span className="trade-price-pill">{price}</span>
              <span className="trade-condition-pill">{condition}</span>
            </div>

            <button
              type="button"
              className="trade-close-btn"
              onClick={onClose}
              title="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="trade-modal-body">
            <h3 className="trade-item-title">{pin.title}</h3>

            <div className="trade-seller-row">
              <span>Listed by</span>
              <span className="trade-seller-pill">
                {pin.createdBy?.avatar && pin.createdBy.avatar.startsWith('http') ? (
                  <img src={pin.createdBy.avatar} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span>{pin.createdBy?.avatar || '👤'}</span>
                )}
                <span>{pin.createdBy?.name || 'Campus Student'}</span>
              </span>
            </div>

            {marketData.photoUrl && (
              <img
                src={marketData.photoUrl}
                alt={pin.title}
                className="trade-item-photo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <p className="trade-item-desc">
              {pin.description || marketData.description || 'No description provided by the seller.'}
            </p>

            {/* Comments & Counter-Offers Thread */}
            <div className="trade-comments-section">
              <div className="trade-comments-heading">
                <span>💬 Offers & Trade Comments ({comments.length})</span>
                <span className="trade-comments-subtitle">
                  Live campus negotiations
                </span>
              </div>

              <div className="trade-comments-list">
                {comments.length === 0 ? (
                  <div className="trade-no-comments">
                    No offers or comments yet. Make an offer or ask a question below!
                  </div>
                ) : (
                  comments.map((c, idx) => (
                    <div key={c.id || idx} className="trade-comment-item">
                      <div className="trade-comment-header">
                        <div className="trade-comment-author" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {c.author?.avatar && c.author.avatar.startsWith('http') ? (
                            <img src={c.author.avatar} alt="" style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <span>{c.author?.avatar || '👤'}</span>
                          )}
                          <span style={{ color: c.author?.color || 'var(--text-primary)' }}>
                            {c.author?.name || 'Student'}
                          </span>
                        </div>
                        <div className="trade-comment-right">
                          {c.offer && (
                            <span className="trade-offer-chip">
                              💰 {c.offer}
                            </span>
                          )}
                          <span className="trade-comment-time">
                            {formatDate(c.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="trade-comment-text">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Comment & Offer Form */}
          <form className="trade-comment-form" onSubmit={handleCommentSubmit}>
            <div className="trade-form-row">
              <input
                type="text"
                className="trade-offer-input"
                placeholder="Offer (e.g. $20, Swap)"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
              />
              <input
                type="text"
                className="trade-msg-input"
                placeholder="Message or question..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                autoFocus
              />
              <button
                type="submit"
                className="btn-pill-primary trade-submit-btn"
              >
                Send ➔
              </button>
            </div>
          </form>

          {/* Direct Live Chat Lounge Button */}
          {pin.roomId && typeof onJoinRoom === 'function' && (
            <div className="trade-modal-footer">
              <button
                type="button"
                className="btn-pill-secondary trade-room-btn"
                onClick={() => {
                  onClose();
                  onJoinRoom(pin.roomId);
                }}
              >
                <span>🚪 Step into Private Negotiation Lounge</span>
                <span>➔</span>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
