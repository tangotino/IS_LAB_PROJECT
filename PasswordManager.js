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

    const fetchPasswords = async () => {
        const token = localStorage.getItem('token'); // Assuming you store the token in local storage
        try {
            const response = await axios.get('http://localhost:5000/api/users/passwords', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPasswords(response.data.data);
        } catch (error) {
            setError('Failed to fetch passwords');
        }
    };

    const handleAddPassword = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/passwords', { website, password }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchPasswords(); // Refresh the list of passwords
            setWebsite('');
            setPassword('');
        } catch (error) {
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
