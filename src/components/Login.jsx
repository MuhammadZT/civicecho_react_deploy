import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login.module.css';

const Login = ({ updateUser }) => {
    const [nid, setNid] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Citizen');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = { nid, password, role };

        try {
            const response = await fetch('http://localhost:8000/backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                const userData = { nid, role };
                updateUser(userData);
                navigate(role === 'Citizen' ? '/citizen-dashboard' : '/admin-dashboard');
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!nid) {
            setError('Please enter your NID first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/backend/request-otp.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid }),
            });

            const result = await response.json();

            if (result.success) {
                navigate('/verify-otp', { state: { nid } });
            } else {
                setError(result.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error requesting OTP:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = () => {
        navigate('/register');
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginWrapper}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Welcome Back!</h2>
                    <p className={styles.subtitle}>
                        Sign in to access your CivicEcho dashboard and manage your grievances.
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="nid" className={styles.label}>NID</label>
                            <input
                                type="text"
                                id="nid"
                                name="nid"
                                placeholder="Enter your NID"
                                required
                                value={nid}
                                onChange={(e) => setNid(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>User Type</label>
                            <div className={styles.radioContainer}>
                                <input
                                    type="radio"
                                    id="citizen"
                                    name="role"
                                    value="Citizen"
                                    checked={role === 'Citizen'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className={styles.radioInput}
                                />
                                <input
                                    type="radio"
                                    id="admin"
                                    name="role"
                                    value="Government Official"
                                    checked={role === 'Government Official'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className={styles.radioInput}
                                />

                                <div className={styles.radioButtons}>
                                    <div
                                        className={`${styles.radioSlider} ${role === 'Government Official' ? styles.sliderAdmin : ''}`}
                                    ></div>
                                    <label
                                        htmlFor="citizen"
                                        className={`${styles.radioLabel} ${role === 'Citizen' ? styles.radioLabelActive : ''}`}
                                    >
                                        Citizen
                                    </label>
                                    <label
                                        htmlFor="admin"
                                        className={`${styles.radioLabel} ${role === 'Government Official' ? styles.radioLabelActive : ''}`}
                                    >
                                        Government Official
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <button
                            onClick={handleForgotPassword}
                            disabled={loading}
                            className={styles.forgotPasswordButton}
                        >
                            Forgot Password?
                        </button>
                        <div>
                            Don't have an account?{' '}
                            <button
                                onClick={handleCreateAccount}
                                className={styles.createAccountButton}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.promoContainer}>
                    <h2 className={styles.promoTitle}>CivicEcho</h2>
                    <p className={styles.promoText}>
                        Revolutionize your grievance management with our comprehensive platform designed for citizens and administrators.
                    </p>

                    <div className={styles.promoFeature}>
                        Streamlined complaint submission and tracking
                    </div>
                    <div className={styles.promoFeature}>
                        Real-time status updates and notifications
                    </div>
                    <div className={styles.promoFeature}>
                        Efficient resolution workflows for administrators
                    </div>
                    <div className={styles.promoFeature}>
                        Comprehensive analytics and reporting
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;