import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiAddEmployee } from '../api/employeeApi';
import './Dashboard.css';

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
            const data = await apiAddEmployee({ token, employee: formData });
            setMessage(`Success! Employee added with ID: ${data.emp_id}`);
            setFormData({
                first_name: '',
                middle_name: '',
                last_name: '',
                start_date: '',
                end_date: ''
            });
        } catch (err) {
            setError(err.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <h1>Add New Employee</h1>
            <div className="card">
                {message && <div style={{ color: '#27ae60', marginBottom: '1rem', fontWeight: 'bold' }}>{message}</div>}
                {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

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

                    <button type="submit" disabled={loading} className="btn" style={{ marginTop: '1rem' }}>
                        {loading ? 'Adding...' : 'Add Employee'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;
