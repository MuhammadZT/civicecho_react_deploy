import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/citizencomplaint.module.css';

const CitizenComplaint = ({ user, handleLogout }) => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [formData, setFormData] = useState({
        complaintTitle: '',
        complaintText: '',
        category: '',
        district: '',
        upazila: '',
        attachments: null
    });
    const [notifications, setNotifications] = useState([]);
    const [categories, setCategories] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const goToFeedbackPage = (complaintId) => {
        navigate(`/feedback?complaint_id=${complaintId}`);
    };

    const navItems = [
        { to: "/citizens-dashboard", text: "Dashboard", icon: "🏠" },
        { to: "/complaint", text: "New Complaint", icon: "📝", active: true },
        { to: "/feedback", text: "Feedback", icon: "💬" },
        { to: "/about", text: "About", icon: "ℹ️" },
        { to: "/help", text: "Help & Contact", icon: "🆘" },
        { to: "#", text: "Logout", icon: "🚪", onClick: handleLogout }
    ];

    const formTips = [
        "Provide a concise title summarizing your complaint",
        "Be as specific as possible in your complaint description",
        "Choose the most appropriate category for faster routing",
        "Include location details for better context",
        "Attach supporting documents or images if available",
        "Check your spelling and grammar before submitting"
    ];

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setError('');

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files : value
        }));

        if (name === 'district' && value) {
            fetchUpazilas(value);
            setFormData((prev) => ({
                ...prev,
                upazila: ''
            }));
        }
    };

    const fetchUpazilas = async (district) => {
        try {
            const response = await fetch('http://localhost:8000/backend/get_categories_locations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ district }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (_) {
                console.error('Failed to parse upazilas response:', text);
                setError('Failed to load upazilas');
                setUpazilas([]);
                return;
            }

            if (data.success) {
                setUpazilas(data.upazilas || []);
            } else {
                setError(data.message || 'Failed to load upazilas');
                setUpazilas([]);
            }
        } catch (error) {
            console.error('Error fetching upazilas:', error);
            setError('Network error while loading upazilas');
            setUpazilas([]);
        }
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.complaintTitle.trim()) {
            errors.push('Complaint title is required');
        } else if (formData.complaintTitle.trim().length < 5) {
            errors.push('Complaint title must be at least 5 characters long');
        } else if (formData.complaintTitle.trim().length > 100) {
            errors.push('Complaint title must not exceed 100 characters');
        }

        if (!formData.complaintText.trim()) {
            errors.push('Complaint description is required');
        } else if (formData.complaintText.trim().length < 10) {
            errors.push('Complaint description must be at least 10 characters long');
        } else if (formData.complaintText.trim().length > 500) {
            errors.push('Complaint description must not exceed 500 characters');
        }

        if (!formData.category) {
            errors.push('Please select a category');
        }

        if (!formData.district) {
            errors.push('Please select a district');
        }

        if (!formData.upazila) {
            errors.push('Please select an upazila');
        }

        if (formData.attachments && formData.attachments.length > 0) {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            const maxSize = 5 * 1024 * 1024;

            for (let i = 0; i < formData.attachments.length; i++) {
                const file = formData.attachments[i];
                if (!allowedTypes.includes(file.type)) {
                    errors.push(`File "${file.name}" has unsupported format. Only JPG, PNG, and PDF are allowed.`);
                }
                if (file.size > maxSize) {
                    errors.push(`File "${file.name}" is too large. Maximum size is 5MB.`);
                }
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join('\n'));
            return;
        }
    
        setSubmitting(true);
    
        // Create the JSON payload
        const jsonData = {
            nid: user.nid,
            complaintTitle: formData.complaintTitle.trim(),
            complaintText: formData.complaintText.trim(),
            category: formData.category,
            district: formData.district,
            upazila: formData.upazila
        };
    
        console.log('Submitting complaint with payload:', jsonData);
    
        // Create FormData
        const fd = new FormData();
        
        // Add JSON data as string
        fd.append('data', JSON.stringify(jsonData));
    
        // Add files if any
        if (formData.attachments && formData.attachments.length > 0) {
            for (let i = 0; i < formData.attachments.length; i++) {
                fd.append('attachments[]', formData.attachments[i]);
                console.log('Added attachment:', formData.attachments[i].name);
            }
        }
    
        // Log FormData contents for debugging
        console.log('FormData contents:');
        for (let [key, value] of fd.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }
    
        try {
            const response = await fetch('http://localhost:8000/backend/complaint.php', {
                method: 'POST',
                body: fd,
                // Don't set Content-Type header - let browser set it with boundary for FormData
            });
    
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers]);
    
            const text = await response.text();
            console.log('Raw response from complaint.php:', text);
    
            // Check if response is empty
            if (!text.trim()) {
                setError('Server returned empty response');
                return;
            }
    
            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                setError(`Server returned invalid JSON: ${text.substring(0, 200)}...`);
                return;
            }
    
            if (result.success) {
                alert(`Complaint submitted successfully!\nComplaint ID: ${result.complaint_id}\nUploaded files: ${result.uploaded_files?.length || 0}`);
    
                // Reset form
                setFormData({
                    complaintTitle: '',
                    complaintText: '',
                    category: '',
                    district: '',
                    upazila: '',
                    attachments: null
                });
    
                // Reset file input
                const fileInput = document.getElementById('attachments');
                if (fileInput) {
                    fileInput.value = '';
                }
    
                await fetchNotifications();
                navigate('/citizens-dashboard');
            } else {
                setError(result.message || 'Failed to submit complaint');
                console.error('Server error:', result);
            }
        } catch (error) {
            console.error('Network error submitting complaint:', error);
            setError(`Network error occurred: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://localhost:8000/backend/notifications.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nid: user.nid }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (_) {
                console.error('Failed to parse notifications response:', text);
                return;
            }

            if (data.success) {
                console.log('Fetched notifications:', data.notifications);
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchCategoriesAndLocations = async () => {
        try {
            const response = await fetch('http://localhost:8000/backend/get_categories_locations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (_) {
                console.error('Failed to parse categories response:', text);
                setError('Failed to load form data');
                return;
            }

            if (data.success) {
                setCategories(data.categories || []);
                setDistricts(data.districts || []);
            } else {
                setError(data.message || 'Failed to load form data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Network error while loading form data');
        }
    };

    useEffect(() => {
        console.log('CitizenComplaint component rendered');
        const initializeData = async () => {
            setLoading(true);
            await Promise.all([
                fetchCategoriesAndLocations(),
                fetchNotifications()
            ]);
            setLoading(false);
        };

        if (user?.nid) {
            initializeData();
        } else {
            setLoading(false);
        }
    }, [user?.nid]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && sidebarActive) {
                setSidebarActive(false);
            }
            if (event.ctrlKey && event.key === 'n') {
                event.preventDefault();
                toggleSidebar();
            }
        };

        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('notification-sidebar');
            const toggleButton = document.getElementById('toggle-notifications');
            const closeButton = document.querySelector(`.${styles.closeSidebar}`);

            if (
                sidebarActive &&
                sidebar &&
                !sidebar.contains(event.target) &&
                event.target !== toggleButton &&
                closeButton &&
                !closeButton.contains(event.target)
            ) {
                setSidebarActive(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [sidebarActive]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    Loading complaint form...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    {navItems.map((item, index) => (
                        <li key={`nav-${index}`} className={styles.navItem}>
                            <Link
                                to={item.to}
                                onClick={item.onClick}
                                className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.text}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={styles.main}>
                <button
                    id="toggle-notifications"
                    onClick={toggleSidebar}
                    className={styles.toggleButton}
                    aria-label="Toggle notifications"
                >
                    🔔
                </button>

                <aside
                    id="notification-sidebar"
                    className={`${styles.sidebar} ${sidebarActive ? styles.sidebarActive : ''}`}
                    role="complementary"
                    aria-label="Notifications panel"
                >
                    <button
                        onClick={toggleSidebar}
                        className={styles.closeSidebar}
                        aria-label="Close notifications"
                    >
                        ✕
                    </button>
                    <h2 className={styles.sidebarTitle}>Notifications</h2>
                    {notifications.length > 0 ? (
                        <ul className={styles.notificationList}>
                            {notifications.map((notification, index) => (
    <li
        key={`notification-${notification.notification_id || notification.id}-${index}`} // Use notification_id instead of id
        onClick={() => goToFeedbackPage(notification.complaint_id || notification.id)}
        className={styles.notificationItem}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToFeedbackPage(notification.complaint_id || notification.id);
            }
        }}
    >
        <div className={styles.notificationType}>
            {notification.icon} {notification.type}
        </div>
        <p className={styles.notificationMessage}>
            {notification.message}
        </p>
    </li>
))}
                        </ul>
                    ) : (
                        <div className={styles.noNotifications}>
                            No new notifications
                        </div>
                    )}
                </aside>

                <div className={styles.content}>
                    <h1 className={styles.title}>Submit a New Complaint</h1>
                    <p className={styles.subtitle}>
                        Your voice matters! Submit your complaint below to help improve your community.
                    </p>

                    <div className={styles.progressSection}>
                        <h3 className={styles.progressTitle}>Complaint Process</h3>
                        <div className={styles.progressSteps}>
                            <div className={styles.progressStep}>
                                <div className={styles.stepCircle}>1</div>
                                <span className={styles.stepLabel}>Submit</span>
                            </div>
                            <div className={styles.progressStep}>
                                <div className={styles.stepCircle}>2</div>
                                <span className={styles.stepLabel}>Review</span>
                            </div>
                            <div className={styles.progressStep}>
                                <div className={styles.stepCircle}>3</div>
                                <span className={styles.stepLabel}>Action</span>
                            </div>
                            <div className={styles.progressStep}>
                                <div className={styles.stepCircle}>4</div>
                                <span className={styles.stepLabel}>Feedback</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div className={styles.sections}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="complaintTitle" className={styles.label}>
                                    📜 Complaint Title:
                                </label>
                                <input
                                    id="complaintTitle"
                                    name="complaintTitle"
                                    type="text"
                                    required
                                    value={formData.complaintTitle}
                                    onChange={handleInputChange}
                                    placeholder="Enter a brief title for your complaint..."
                                    className={styles.input}
                                    minLength={5}
                                    maxLength={100}
                                />
                                <div className={styles.charCount}>
                                    {formData.complaintTitle.length}/100 characters (minimum 5)
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="complaintText" className={styles.label}>
                                    📝 Complaint Description:
                                </label>
                                <textarea
                                    id="complaintText"
                                    name="complaintText"
                                    rows="6"
                                    required
                                    value={formData.complaintText}
                                    onChange={handleInputChange}
                                    placeholder="Describe your issue in detail. Include what happened, when it occurred, and how it affects you..."
                                    className={styles.textarea}
                                    minLength={10}
                                    maxLength={500}
                                />
                                <div className={styles.charCount}>
                                    {formData.complaintText.length}/500 characters (minimum 10)
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="category" className={styles.label}>
                                    📂 Category:
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={`category-${cat}`} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="district" className={styles.label}>
                                    🏢 District:
                                </label>
                                <select
                                    id="district"
                                    name="district"
                                    required
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                >
                                    <option value="">Select District</option>
                                    {districts.map((dist) => (
                                        <option key={`district-${dist}`} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="upazila" className={styles.label}>
                                    📍 Upazila:
                                </label>
                                <select
                                    id="upazila"
                                    name="upazila"
                                    required
                                    value={formData.upazila}
                                    onChange={handleInputChange}
                                    className={styles.select}
                                    disabled={!formData.district}
                                >
                                    <option value="">
                                        {formData.district ? 'Select Upazila' : 'First select a district'}
                                    </option>
                                    {upazilas.map((upz) => (
                                        <option key={`upazila-${upz}`} value={upz}>{upz}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="attachments" className={styles.label}>
                                    📎 Attachments (Optional):
                                </label>
                                <input
                                    id="attachments"
                                    name="attachments"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,application/pdf"
                                    onChange={handleInputChange}
                                    className={styles.fileInput}
                                />
                                <div className={styles.fileInfo}>
                                    Supported formats: JPG, PNG, PDF (Max 5MB per file)
                                </div>
                                {formData.attachments && formData.attachments.length > 0 && (
                                    <div className={styles.fileSelected}>
                                        📄 {formData.attachments.length} file(s) selected
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span>⏳</span>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>Submit Complaint</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={styles.tipsSection}>
                            <h3 className={styles.tipsTitle}>
                                💡 Tips for Effective Complaints
                            </h3>
                            <ul className={styles.tipsList}>
                                {formTips.map((tip, index) => (
                                    <li key={`tip-${index}`}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <p className={styles.footerText}>
                    Building Better Communities Together © Team SM 2025 | All rights not yet reserved.
                </p>
            </footer>
        </div>
    );
};

export default CitizenComplaint;