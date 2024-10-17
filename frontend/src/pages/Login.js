import React, { useState } from 'react';
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
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });

            // Store the token if login is successful
            localStorage.setItem('authToken', data.token);

            // Check if TOTP is required
            if (data.success && data.totpRequired) {
                setIsTotpRequired(true);
            } else if (data.success) {
                alert('Login successful!');
                navigate('/password-manager');
            }
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError('Invalid login credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleTotpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Change the URL to your TOTP verification endpoint
            const { data } = await axios.post('http://localhost:5000/api/users/verify-totp', { email, token: totp });

            if (data.success) {
                alert('Login successful!');
                navigate('/password-manager');
            } else {
                setError('Invalid TOTP code');
            }
        } catch (err) {
            console.error('TOTP verification error:', err.response ? err.response.data : err.message);
            setError('Failed to verify TOTP');
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
                        <button type="submit" className="btn btn-primary" disabled={loading}>
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
