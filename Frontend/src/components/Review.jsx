import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  MessageSquare,
  Trash2,
  AlertCircle,
  Check,
  User,
  Send,
  LogIn
} from 'lucide-react';

const Review = ({ productId, onReviewsUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch reviews for specific product
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/review/${productId}`);
      
      let fetchedList = [];
      if (Array.isArray(res.data)) {
        fetchedList = res.data;
      } else if (res.data?.reviews && Array.isArray(res.data.reviews)) {
        fetchedList = res.data.reviews;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        fetchedList = res.data.data;
      }

      setReviews(fetchedList);
      if (onReviewsUpdate) {
        onReviewsUpdate(fetchedList);
      }
    } catch (err) {
      console.error('Error fetching product reviews:', err);
      // Non-blocking error if product has no reviews yet
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, onReviewsUpdate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle posting a review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      setFormError('Please enter a comment for your review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/review/add', {
        productId,
        rating: Number(rating),
        comment: comment.trim()
      });

      if (res.data?.success || res.status === 201 || res.status === 200) {
        setSuccessMessage('Thank you! Your review has been published.');
        setComment('');
        setRating(5);
        fetchReviews();

        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setFormError(res.data?.message || 'Could not submit review.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setFormError(
        err.response?.data?.message || err.response?.data?.error || 'Failed to submit review. You may have already reviewed this product.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/review/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      if (onReviewsUpdate) {
        onReviewsUpdate(reviews.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Calculate Average Rating
  const totalRatingSum = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  const avgRating = reviews.length > 0 ? (totalRatingSum / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" /> Product Feedback
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Ratings & Customer Reviews</h2>
          <p className="text-xs text-slate-500 mt-1">
            Read verified customer experiences or share your own thoughts
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/80 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-xl font-extrabold text-amber-900">{avgRating}</span>
            </div>
            <div className="h-6 w-px bg-amber-200"></div>
            <span className="text-xs font-bold text-amber-800">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <div className="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Leave a Review</h3>
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign in to write a review
            </button>
          )}
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-lg hover:bg-amber-50 transition active:scale-95"
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 transition ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-600">
                {rating} / 5 Star{rating > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Comment input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Written Experience
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                user
                  ? 'Describe item quality, delivery, build, or features...'
                  : 'Please log in to write your review...'
              }
              className="w-full p-3.5 bg-white border border-slate-200 text-xs font-medium text-slate-900 rounded-xl focus:border-indigo-600 focus:outline-none transition placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{submitting ? 'Posting Review...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Customer Feedback ({reviews.length})</h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">Loading product reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => {
              const reviewUser = rev.userId && typeof rev.userId === 'object' ? rev.userId : (rev.user || {});
              const reviewerName = reviewUser.name || rev.userName || 'Verified Buyer';
              const canDelete =
                user &&
                (user._id === reviewUser._id ||
                  user._id === rev.userId ||
                  user?.role?.toLowerCase() === 'admin');

              return (
                <div
                  key={rev._id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">{reviewerName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (Number(rev.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed pl-11">
                      {rev.comment}
                    </p>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev._id)}
                      className="self-end sm:self-start p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No reviews yet for this product</p>
            <p className="text-[11px] text-slate-500 mt-1">Be the first customer to write a review!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
