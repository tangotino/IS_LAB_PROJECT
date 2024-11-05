import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './Login.css'; // Reuse the same CSS from the Login page for consistent styling
import logo from '../assets/logo.png'; // Correctly import the logo

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [enable2FA, setEnable2FA] = useState(false); // State to manage 2FA option
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState(''); // State for QR code URL
    const [totpSecret, setTotpSecret] = useState(''); // State for TOTP secret
    const [showModal, setShowModal] = useState(false); 
    const navigate = useNavigate(); // Use navigate for redirection after successful registration

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Include enable2FA in the request body
            const { data } = await axios.post('http://localhost:5000/api/users/register', { 
                name, 
                email, 
                password,
                enable2FA // Send the 2FA option to the backend
            });
            if (data.success) {
                setQrCodeUrl(data.qrCodeUrl); // Set the QR code URL from the response
                setTotpSecret(data.totpSecret); // Set the TOTP secret
                setShowModal(true); // Show the modal
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Registration failed');
            console.error('Registration error:', err.response ? err.response.data : err.message); // Log the error for debugging
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
                    <h2 className="text-center">Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <div className="form-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={enable2FA} 
                                    onChange={(e) => setEnable2FA(e.target.checked)} 
                                />
                                Enable Two-Factor Authentication
                            </label>
                        </div>
                        {error && <p className="text-danger">{error}</p>}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        {/* New Button that navigates to the login page */}
                        <Link to="/login" className="btn btn-secondary">
                            Already have an account? Log In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal for QR Code Display */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">Scan this QR Code</div>
                        <div className="modal-body">
                            <QRCodeCanvas value={qrCodeUrl} />
                            <p>Or enter this code: <strong>{totpSecret}</strong></p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn" onClick={() => setShowModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
