
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTotpRequired, setIsTotpRequired] = useState(false);
    const [tempToken, setTempToken] = useState(''); // Temporary token for post-login TOTP
    const [lockTime, setLockTime] = useState(null); 
    const navigate = useNavigate();

    // Countdown logic
    useEffect(() => {
        if (lockTime > 0) {
            const timer = setInterval(() => {
                setLockTime((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else if (lockTime === 0) {
            setLockTime(null); 
            setError('');
        }
    }, [lockTime]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
            
            if (data.success) {
                // Check if TOTP is required
                if (data.totpRequired) {
                    setIsTotpRequired(true);  // Enable TOTP input
                    setTempToken(data.token);  // Store the temporary token for further verification
                } else {
                    // Proceed to password manager as TOTP is not required
                    localStorage.setItem('authToken', data.token);
                    alert('Login successful!');
                    navigate('/password-manager');
                }
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            if (err.response?.data?.remainingTime) {
                setLockTime(err.response.data.remainingTime); 
                setError(`Account is locked. Try again in ${err.response.data.remainingTime} seconds.`);
            } else {
                setError(err.response?.data?.message || 'Invalid login credentials');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleTotpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const { data } = await axios.post('http://localhost:5000/api/users/verify-totp', { email, token: totp });
            
            if (data.success) {
                localStorage.setItem('authToken', data.token); // Save token after TOTP verification
                alert('Login successful!');
                navigate('/password-manager'); // Navigate to password manager after successful TOTP verification
            } else {
                setError('Invalid TOTP code');
                setTotp('');  // Clear TOTP input field
            }
        } catch (err) {
            console.error('TOTP verification error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Failed to verify TOTP');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="login-container">
            <div className="login-left">
                <img src={logo} alt="LockOut Logo" className="logo" />
                <h1 className="app-title">LockOut</h1>
            </div>
            <div className="login-right">
                <div className="login-box">
                    <h2 className="text-center">{isTotpRequired ? 'Verify TOTP' : 'Login'}</h2>
                    <form onSubmit={isTotpRequired ? handleTotpSubmit : handleLoginSubmit}>
                        {!isTotpRequired ? (
                            <>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Enter TOTP Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={totp}
                                        onChange={(e) => setTotp(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        {error && <p className="text-danger">{error}</p>}
                        {lockTime && <p className="text-warning">Please wait {lockTime} seconds before trying again.</p>}
                        <button type="submit" className="btn btn-primary" disabled={loading || lockTime > 0}>
                            {loading ? 'Processing...' : (isTotpRequired ? 'Verify' : 'Login')}
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <Link to="/register" className="btn btn-secondary">
                            New user? Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
