import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// FIX: Use environment variable for production
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Analyze() {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();

    // Validation
    if (!jobTitle.trim()) {
      setError('Job title is required');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Job description is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/analyses', {
        resume_id: resumeId,
        job_title: jobTitle,
        job_description: jobDescription,
      });

      setAnalysis(res.data);
    } catch (err) {
      console.error('Analysis error:', err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Check your internet connection.');
      } else {
        setError('Failed to analyze resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (score >= 60) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return '🟢 Excellent Match';
    if (score >= 60) return '🟡 Good Match';
    return '🔴 Needs Improvement';
  };

  const scoreColor = analysis ? getScoreColor(analysis.match_score) : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Resume Analysis</h1>
            <p className="text-sm text-gray-500">Match your resume to job descriptions</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysis ? (
          // Input Form
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Analyze Your Resume</h2>
            <p className="text-gray-600 mb-8">
              Paste a job description to see how well your resume matches and get personalized recommendations
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Python Developer, Product Manager, etc."
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description *
                </label>
                <p className="text-xs text-gray-500 mb-2">Copy the full job posting from LinkedIn, Indeed, or any job board</p>
                <textarea
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing your resume...</span>
                  </>
                ) : (
                  <span>🔍 Analyze Resume</span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                ⏱️ Analysis takes 10-30 seconds. We analyze using AI to match your resume with the job description.
              </p>
            </form>
          </div>
        ) : (
          // Analysis Results
          <div className="space-y-6">
            {/* Match Score Card */}
            <div className={`${scoreColor.bg} border-2 ${scoreColor.border} rounded-lg p-8 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Match Score</h2>
                <span className={`text-sm font-semibold ${scoreColor.text} px-4 py-2 rounded-full`}>
                  {getScoreLabel(analysis.match_score)}
                </span>
              </div>

              <div className="mb-4">
                <div className={`text-6xl font-bold ${scoreColor.text}`}>
                  {analysis.match_score}%
                </div>
                <p className="text-gray-600 mt-2">
                  {analysis.match_score >= 80
                    ? '🎉 Excellent! Your resume is a great match for this role.'
                    : analysis.match_score >= 60
                    ? '✅ Good match! Some improvements could help increase your chances.'
                    : '⚠️ This role may require additional skills or experience.'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    analysis.match_score >= 80
                      ? 'bg-green-500'
                      : analysis.match_score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.match_score}%` }}
                ></div>
              </div>
            </div>

            {/* Job Title & Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Position: {analysis.job_title || 'Unknown'}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{jobDescription}</p>
            </div>

            {/* Missing Skills */}
            {analysis.missing_skills && analysis.missing_skills.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🎯 Skills to Develop ({analysis.missing_skills.length})
                </h3>
                <p className="text-gray-600 mb-4">These skills appear in the job description but not in your resume:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.missing_skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition"
                    >
                      <p className="text-red-700 font-semibold capitalize">{skill}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 font-semibold mb-2">💡 Next Steps:</p>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>✓ Add these skills to your resume (if you have experience)</li>
                    <li>✓ Highlight projects where you used these technologies</li>
                    <li>✓ Consider learning these skills for future opportunities</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  💡 Personalized Recommendations
                </h3>

                <div className="space-y-4">
                  {analysis.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border-l-4 rounded-lg ${
                        rec.priority === 'high'
                          ? 'border-red-400 bg-red-50'
                          : rec.priority === 'medium'
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-blue-400 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-800">{rec.text}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          rec.priority === 'high'
                            ? 'bg-red-200 text-red-800'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6 flex space-x-4">
              <button
                onClick={() => {
                  setAnalysis(null);
                  setJobTitle('');
                  setJobDescription('');
                  setError('');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                🔄 Analyze Another Job
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
              >
                📊 Back to Dashboard
              </button>
            </div>

            {/* Export Option (Future) */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">📥 Coming Soon</h3>
              <p className="text-gray-700">Download your analysis as PDF, save your progress, and get AI-generated cover letters.</p>
              <p className="text-sm text-gray-600 mt-2">Upgrade to Premium to unlock these features!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}