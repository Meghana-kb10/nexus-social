import React, { useRef, useState } from 'react';
import { PhotoIcon, SmileIcon, SendIcon } from '../common/Icons';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../api/postApi';

export const CreatePostCard = ({ onAddPost, inputRef }) => {
  const { user } = useAuth();
  const [postText, setPostText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [showFeelingsPicker, setShowFeelingsPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const imageInputRef = useRef(null);

  const feelingsList = ['😊 Happy', '🔥 Motivated', '🚀 Excited', '😴 Tired', '🎉 Celebrating', '💻 Coding'];

  const currentUser = {
    name: user?.name || 'Alex Rivera',
    username: user?.username || 'alexdev',
    badge: user?.badge || 'Creator',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    const trimmedContent = postText.trim();
    const trimmedImageUrl = imageUrl.trim();

    // Reject if both content and imageUrl are empty or whitespace-only
    if (!trimmedContent && !trimmedImageUrl) {
      setError('Post cannot be empty. Please enter text or an image URL.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // If a feeling was selected and there's text, append it cleanly to content
      let finalContent = trimmedContent;
      if (selectedFeeling) {
        finalContent = trimmedContent ? `${trimmedContent} (${selectedFeeling})` : selectedFeeling;
      }

      const payload = {};
      if (finalContent) payload.content = finalContent;
      if (trimmedImageUrl) payload.imageUrl = trimmedImageUrl;

      const response = await createPost(payload);

      if (response && response.post) {
        onAddPost(response.post);
        setPostText('');
        setImageUrl('');
        setImageName('');
        setSelectedFeeling('');
        setError('');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.userMessage || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelection = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be 3 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(typeof reader.result === 'string' ? reader.result : '');
      setImageName(file.name);
      setError('');
    };
    reader.onerror = () => setError('Could not read that image. Please try another file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="create-post-card">
      {/* Header with Title and Segmented Pills */}
      <div className="create-post-header">
        <h2 className="create-post-title">Create Post</h2>
        <div className="create-post-pills">
          <button
            type="button"
            className={`post-type-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts
          </button>
          <button
            type="button"
            className={`post-type-pill ${activeTab === 'updates' ? 'active' : ''}`}
            onClick={() => setActiveTab('updates')}
          >
            Updates
          </button>
        </div>
      </div>

      {/* Input Body */}
      <div className="create-post-body">
        <Avatar src={currentUser.avatar} size={40} />
        <div className="create-post-input-box">
          <textarea
            ref={inputRef}
            className="create-post-textarea"
            placeholder="What's on your mind?"
            aria-label="What's on your mind?"
            value={postText}
            onChange={(e) => {
              setPostText(e.target.value);
              if (error) setError('');
            }}
            rows={2}
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            aria-label="Choose an image to attach"
            tabIndex={-1}
            style={{ display: 'none' }}
            onChange={handleImageSelection}
          />

          {/* Error Message Display */}
          {error && (
            <div
              style={{
                color: '#f87171',
                fontSize: '0.8rem',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div className="image-preview-box">
              <img
                src={imageUrl}
                alt={imageName ? `Preview of ${imageName}` : 'Upload preview'}
                className="image-preview-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <button
                type="button"
                className="remove-image-btn"
                aria-label="Remove selected image"
                onClick={() => {
                  setImageUrl('');
                  setImageName('');
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Feeling Pill Indicator */}
          {selectedFeeling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="post-tag-pill" style={{ cursor: 'pointer' }} onClick={() => setSelectedFeeling('')}>
                Feeling: {selectedFeeling} ✕
              </span>
            </div>
          )}

          {/* Feelings Picker Bar */}
          {showFeelingsPicker && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '6px 0' }}>
              {feelingsList.map((feeling) => (
                <button
                  key={feeling}
                  type="button"
                  className="filter-tab-btn"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => {
                    setSelectedFeeling(feeling);
                    setShowFeelingsPicker(false);
                  }}
                >
                  {feeling}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="create-post-divider" />

      {/* Action Footer */}
      <div className="create-post-actions">
        <div className="create-post-buttons-left">
          <button
            type="button"
            className="action-trigger-btn"
            onClick={() => imageInputRef.current?.click()}
            title="Add Photo"
          >
            <PhotoIcon size={18} />
            <span>Add Photo</span>
          </button>

          <button
            type="button"
            className="action-trigger-btn"
            onClick={() => setShowFeelingsPicker(!showFeelingsPicker)}
            title="Feeling / Activity"
          >
            <SmileIcon size={18} />
            <span>Feeling</span>
          </button>
        </div>

        <button
          type="button"
          className="btn-submit-post"
          onClick={handleSubmit}
          aria-label={isSubmitting ? 'Publishing post' : 'Publish post'}
          disabled={isSubmitting || (!postText.trim() && !imageUrl.trim())}
          style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          <SendIcon size={16} />
          <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
        </button>
      </div>
    </div>
  );
};
