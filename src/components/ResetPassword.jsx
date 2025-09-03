import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/reset-password.module.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { nid } = location.state || {};

    useEffect(() => {
        if (!nid) {
            navigate('/login');
        }
    }, [nid, navigate]);

    const validatePassword = (password) => {
        const minLength = password.length >= 6;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            minLength,
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSpecialChar,
            isValid: minLength && hasUppercase && hasLowercase && hasNumber
        };
    };

    const passwordValidation = validatePassword(newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!passwordValidation.isValid) {
            setError('Password does not meet the minimum requirements.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/backend/reset-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, newPassword }),
            });

            const result = await response.json();

            if (result.success) {
                // Show success message and redirect to login after a delay
                alert('Password reset successful! You can now login with your new password.');
                navigate('/login');
            } else {
                setError(result.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
        setError(''); // Clear error when user starts typing
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setError(''); // Clear error when user starts typing
    };

    return (
        <div className={styles.container}>
            <div className={styles.resetWrapper}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Reset Password</h2>
                    <p className={styles.subtitle}>
                        Create a new secure password for your CivicEcho account.
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="newPassword" className={styles.label}>
                                New Password
                            </label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    required
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                    className={styles.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.togglePassword}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Confirm Password
                            </label>
                            <div className={styles.passwordContainer}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    required
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={styles.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles.togglePassword}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {newPassword && (
                            <div className={styles.passwordRequirements}>
                                <h4>Password Requirements:</h4>
                                <div className={`${styles.requirement} ${passwordValidation.minLength ? styles.valid : styles.invalid}`}>
                                    {passwordValidation.minLength ? '✓' : '✗'} At least 6 characters
                                </div>
                                <div className={`${styles.requirement} ${passwordValidation.hasUppercase ? styles.valid : styles.invalid}`}>
                                    {passwordValidation.hasUppercase ? '✓' : '✗'} One uppercase letter
                                </div>
                                <div className={`${styles.requirement} ${passwordValidation.hasLowercase ? styles.valid : styles.invalid}`}>
                                    {passwordValidation.hasLowercase ? '✓' : '✗'} One lowercase letter
                                </div>
                                <div className={`${styles.requirement} ${passwordValidation.hasNumber ? styles.valid : styles.invalid}`}>
                                    {passwordValidation.hasNumber ? '✓' : '✗'} One number
                                </div>
                            </div>
                        )}

                        {confirmPassword && newPassword !== confirmPassword && (
                            <div className={styles.passwordMismatch}>
                                Passwords do not match
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
                            className={styles.submitButton}
                        >
                            {loading ? 'Updating Password...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <button
                            onClick={() => navigate('/login')}
                            className={styles.backButton}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>

                <div className={styles.securityContainer}>
                    <h3 className={styles.securityTitle}>Password Security Tips</h3>
                    <div className={styles.securityTip}>
                        Use a combination of letters, numbers, and symbols
                    </div>
                    <div className={styles.securityTip}>
                        Avoid using personal information like names or dates
                    </div>
                    <div className={styles.securityTip}>
                        Don't reuse passwords from other accounts
                    </div>
                    <div className={styles.securityTip}>
                        Consider using a password manager
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;