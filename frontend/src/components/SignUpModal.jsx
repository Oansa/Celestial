import React, { useState } from 'react';
import { signup } from '../services/auth';
import { authenticate, getPrincipal, II_URL } from '../services/icAuth';
import './SignUpModal.css';

const SignUpModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    internetId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [principal, setPrincipal] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.secondName.trim()) newErrors.secondName = 'Second name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.internetId.trim()) newErrors.internetId = 'Internet Identity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleInternetIdentityAuth = async () => {
    setIsAuthLoading(true);
    setErrors(prev => ({ ...prev, internetId: '' }));
    
    try {
      await authenticate(II_URL.ic);
      const userPrincipal = await getPrincipal();
      if (userPrincipal) {
        setPrincipal(userPrincipal);
        setFormData(prev => ({ ...prev, internetId: userPrincipal }));
      }
    } catch (error) {
      console.error('Internet Identity authentication failed:', error);
      setErrors(prev => ({ ...prev, internetId: 'Authentication failed. Please try again.' }));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleClearAuth = () => {
    setPrincipal(null);
    setFormData(prev => ({ ...prev, internetId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await signup(formData.firstName, formData.secondName, formData.email, formData.internetId);
      onSuccess(formData.firstName);
      onClose();
    } catch (error) {
      console.error('Signup failed:', error);
      setErrors({ submit: 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.firstName.trim() && 
                     formData.secondName.trim() && 
                     formData.email.trim() && 
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
                     formData.internetId.trim();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Second Name</label>
            <input
              type="text"
              name="secondName"
              value={formData.secondName}
              onChange={handleInputChange}
              placeholder="Enter your second name"
              className={errors.secondName ? 'error' : ''}
            />
            {errors.secondName && <span className="error-message">{errors.secondName}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Internet Identity</label>
            {principal ? (
              <div className="internet-identity-display">
                <div className="identity-info">
                  <span className="identity-label">Authenticated Principal:</span>
                  <span className="identity-value">{principal}</span>
                </div>
                <button 
                  type="button"
                  className="clear-auth-button"
                  onClick={handleClearAuth}
                >
                  Clear & Re-authenticate
                </button>
              </div>
            ) : (
              <button 
                type="button"
                className="internet-identity-button"
                onClick={handleInternetIdentityAuth}
                disabled={isAuthLoading}
              >
                {isAuthLoading ? 'Authenticating...' : 'Authenticate with Internet Identity'}
              </button>
            )}
            {errors.internetId && <span className="error-message">{errors.internetId}</span>}
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button 
            type="submit" 
            className="submit-button"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Signing up...' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;
