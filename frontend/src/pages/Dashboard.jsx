import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// FIX: Use environment variable for production, localhost for development
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// FIX: Add token to EVERY request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchResumes();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/api/users/me');
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await API.get('/api/resumes');
      setResumes(res.data || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF and DOCX files are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add new resume to list
      setResumes([
        { 
          id: res.data.resume_id, 
          file_name: file.name, 
          created_at: new Date().toISOString() 
        },
        ...resumes
      ]);
      
      alert(`✓ Resume uploaded!\n\nSkills detected:\n${res.data.skills.join(', ')}`);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.error || 'Upload failed. Please try again.';
      alert(`❌ ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Resume Screener</h1>
            <p className="text-sm text-gray-500">Analyze & Optimize Your Resume</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-800 font-semibold">{user?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Your Resume</h2>
          <p className="text-gray-600 mb-6">Supported formats: PDF, DOCX</p>
          
          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-4-4m0 0l-4 4m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-gray-700 font-semibold">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PDF or DOCX (Max 10MB)</p>
            </div>
            <input 
              type="file" 
              accept=".pdf,.docx" 
              onChange={handleUpload} 
              disabled={uploading} 
              className="hidden" 
            />
          </label>

          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Uploading your resume...</p>
            </div>
          )}
        </div>

        {/* Resumes List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Resumes</h2>
          
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mt-4">No resumes uploaded yet</p>
              <p className="text-sm text-gray-500">Upload your first resume to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div 
                  key={resume.id} 
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-800">{resume.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/analyze/${resume.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition transform hover:scale-105"
                  >
                    Analyze
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}