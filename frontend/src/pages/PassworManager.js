import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PasswordManager = () => {
    const [website, setWebsite] = useState('');
    const [password, setPassword] = useState('');
    const [passwords, setPasswords] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPasswords();
    }, []);

    // Fetch stored passwords from the backend
    const fetchPasswords = async () => {
        const authToken = localStorage.getItem('authToken'); // Ensure the token name matches
        console.log('Auth Token:', authToken); // Log the auth token for debugging
    
        try {
            const response = await axios.get('http://localhost:5000/api/users/passwords', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
    
            // Check if the response data has the expected structure
            if (response.data && response.data.data) {
                setPasswords(response.data.data); // Set the passwords state
            } else {
                // Handle unexpected response structure
                console.error('Unexpected response structure:', response.data);
                setError('Unexpected response format from server');
                return; // Exit the function early
            }
        } catch (error) {
            // Differentiate between error types for better debugging
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Error fetching passwords:', error.response.status, error.response.data); // Log status and response data
                if (error.response.status === 401) {
                    setError('Unauthorized: Invalid or missing authorization token');
                } else if (error.response.status >= 500) {
                    setError('Server error: Please try again later');
                } else {
                    setError('Error fetching passwords: ' + error.response.data.message);
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                setError('Network error: Unable to reach the server');
            } else {
                // Something happened in setting up the request
                console.error('Error setting up request:', error.message);
                setError('Error fetching passwords: ' + error.message);
            }
        }
    };

    // Handle adding a new password
    const handleAddPassword = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const authToken = localStorage.getItem('authToken'); // Ensure the token name matches
            await axios.post('http://localhost:5000/api/users/passwords', { website, password }, {
                headers: { Authorization: `Bearer ${authToken}` }, // Fixed string interpolation
            });
            fetchPasswords(); // Refresh the list of passwords
            setWebsite('');
            setPassword('');
        } catch (error) {
            console.error('Error saving password:', error); // Log the error for debugging
            setError('Failed to save password');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Password Manager</h2>
            <form onSubmit={handleAddPassword}>
                <div className="form-group">
                    <label>Website</label>
                    <input
                        type="text"
                        className="form-control"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
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
                <button type="submit" className="btn btn-primary">Add Password</button>
            </form>

            <h3 className="mt-4">Stored Passwords</h3>
            <ul>
                {passwords.map((item) => (
                    <li key={item._id}>{item.website}: {item.password}</li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordManager;
