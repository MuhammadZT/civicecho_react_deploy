import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/verify-otp.module.css';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { nid } = location.state || {};

    useEffect(() => {
        if (!nid) {
            navigate('/login');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [nid, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/backend/verify-otp.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, otp }),
            });

            const result = await response.json();

            if (result.success) {
                navigate('/reset-password', { state: { nid } });
            } else {
                setError(result.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setCanResend(false);
        setTimeLeft(300);

        try {
            const response = await fetch('http://localhost:8000/backend/request-otp.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid }),
            });

            const result = await response.json();

            if (result.success) {
                setError(''); // Clear any previous errors
                // Restart the timer
                const timer = setInterval(() => {
                    setTimeLeft((prevTime) => {
                        if (prevTime <= 1) {
                            setCanResend(true);
                            clearInterval(timer);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
            } else {
                setError(result.message || 'Failed to resend OTP.');
                setCanResend(true);
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            setError('Failed to resend OTP. Please try again.');
            setCanResend(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 6) {
            setOtp(value);
            setError(''); // Clear error when user starts typing
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.otpWrapper}>
                <div className={styles.formContainer}>
                    <h2 className={styles.title}>Verify OTP</h2>
                    <p className={styles.subtitle}>
                        We've sent a 6-digit verification code to your registered email address.
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="otp" className={styles.label}>
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                placeholder="000000"
                                required
                                value={otp}
                                onChange={handleOtpChange}
                                className={styles.otpInput}
                                maxLength="6"
                                autoComplete="off"
                            />
                        </div>

                        <div className={styles.timerContainer}>
                            {timeLeft > 0 ? (
                                <p className={styles.timer}>
                                    Time remaining: {formatTime(timeLeft)}
                                </p>
                            ) : (
                                <p className={styles.expired}>OTP has expired</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className={styles.submitButton}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>Didn't receive the code?</p>
                        <button
                            onClick={handleResendOTP}
                            disabled={loading || !canResend}
                            className={styles.resendButton}
                        >
                            {loading ? 'Sending...' : 'Resend OTP'}
                        </button>
                        
                        <button
                            onClick={() => navigate('/login')}
                            className={styles.backButton}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>

                <div className={styles.infoContainer}>
                    <h3 className={styles.infoTitle}>Security Information</h3>
                    <div className={styles.infoItem}>
                        <strong>Valid for:</strong> 5 minutes
                    </div>
                    <div className={styles.infoItem}>
                        <strong>One-time use:</strong> Each OTP can only be used once
                    </div>
                    <div className={styles.infoItem}>
                        <strong>Secure:</strong> Your OTP is encrypted and secure
                    </div>
                    
                    <div className={styles.helpText}>
                        If you're having trouble receiving the OTP, please check your spam folder
                        or contact support.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;