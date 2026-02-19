import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const AddEmployee = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        start_date: '',
        end_date: ''
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/api/employees/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! Employee added with ID: ${data.emp_id}`);
                setFormData({
                    first_name: '',
                    middle_name: '',
                    last_name: '',
                    start_date: '',
                    end_date: ''
                });
            } else {
                setError(data.error || 'Failed to add employee');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <h1>Add New Employee</h1>
            <div className="card">
                {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                    <div className="form-group">
                        <label>First Name *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Middle Name</label>
                        <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Date *</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Adding...' : 'Add Employee'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;
