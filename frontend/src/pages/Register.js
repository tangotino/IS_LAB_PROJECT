import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import './Login.css'; // Reuse the same CSS from the Login page for consistent styling
import logo from '../assets/logo.png'; // Correctly import the logo

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Use navigate for redirection after successful registration

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/users/register', { name, email, password });
            alert('Registration successful!');
            navigate('/login'); // Redirect to login page after successful registration
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
        </div>
    );
};

export default Register;
