import React, { useState } from 'react';
import './ShareButtons.css';

const ShareButtons: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const title = 'My Court of Public Opinion - Tier List';
  const text = 'Check out my historical figures tier list!';

  const url = () => window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: url()
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(`${text} ${url()}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const shareToReddit = () => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url())}&title=${encodeURIComponent(title)}`;
    window.open(redditUrl, '_blank', 'width=600,height=400');
  };

  const isSupported = (): boolean => {
    return !!(navigator.share);
  };

  return (
    <div className="share-buttons-container">
      <h3>Share Your Tier List</h3>
      <div className="share-buttons">
        <button
          className="share-btn copy-link-btn"
          onClick={handleCopyLink}
          title="Copy link to clipboard"
        >
          {copied ? '✓ Copied!' : '🔗 Copy Link'}
        </button>

        {isSupported() && (
          <button
            className="share-btn native-share-btn"
            onClick={handleWebShare}
            title="Share using native share dialog"
          >
            📤 Share
          </button>
        )}

        <button
          className="share-btn twitter-btn"
          onClick={shareToTwitter}
          title="Share on Twitter"
        >
          𝕏 Twitter
        </button>

        <button
          className="share-btn facebook-btn"
          onClick={shareToFacebook}
          title="Share on Facebook"
        >
          f Facebook
        </button>

        <button
          className="share-btn linkedin-btn"
          onClick={shareToLinkedIn}
          title="Share on LinkedIn"
        >
          in LinkedIn
        </button>

        <button
          className="share-btn reddit-btn"
          onClick={shareToReddit}
          title="Share on Reddit"
        >
          🔴 Reddit
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
