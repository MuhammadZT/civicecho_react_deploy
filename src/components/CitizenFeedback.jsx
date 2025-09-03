import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/citizenfeedback.module.css';

const CitizenFeedbackPage = ({ user, handleLogout }) => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [resolvedComplaints, setResolvedComplaints] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Enhanced state for search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        dateRange: '',
        status: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // State for rating animation
    const [animateRating, setAnimateRating] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Categories for filter dropdown (matching your database)
    const categories = [
        'Public Infrastructure',
        'Waste Management',
        'Traffic and Transport',
        'Health and Safety',
        'Environment and Pollution',
        'Education',
        'Law and Order',
        'Utilities',
        'Corruption and Governance',
        'Housing and Urban Development'
    ];

    // Status options for filtering
    const statusOptions = [
        'Resolved',
        'Closed',
        'Pending Review'
    ];

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const loadFeedback = (complaintId) => {
        const details = resolvedComplaints.find(c => c.id === parseInt(complaintId));
        if (details) {
            setSelectedComplaint(details);
            setRating(0);
            setFeedback('');
        }
    };

    const handleStarClick = (starRating) => {
        setRating(starRating);
        setAnimateRating(true);
        setTimeout(() => setAnimateRating(false), 500);
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    };

    // Enhanced filter function for date range with better error handling
    const filterByDateRange = (complaint, dateRange) => {
        if (!dateRange) return true;

        // Try multiple date fields and handle parsing errors
        const dateFields = [
            complaint.created_at,
            complaint.date,
            complaint.updated_at,
            complaint.resolved_at
        ];

        let complaintDate = null;
        for (const field of dateFields) {
            if (field) {
                const parsed = new Date(field);
                if (!isNaN(parsed.getTime())) {
                    complaintDate = parsed;
                    break;
                }
            }
        }

        // If no valid date found, return true to include in results
        if (!complaintDate) return true;

        const now = new Date();

        switch (dateRange) {
            case 'today':
                return complaintDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return complaintDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return complaintDate >= monthAgo;
            case 'quarter':
                const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                return complaintDate >= quarterAgo;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                return complaintDate >= yearAgo;
            default:
                return true;
        }
    };

    // Enhanced filtered complaints with improved search capabilities
    const filteredComplaints = useMemo(() => {
        return resolvedComplaints.filter(complaint => {
            // Enhanced search - includes more fields and better text handling
            const searchableText = [
                complaint.id?.toString() || '',
                complaint.complaint_id?.toString() || '',
                complaint.title || '',
                complaint.description || '',
                complaint.complaintDesc || '',
                complaint.category || '',
                complaint.location || '',
                complaint.status || ''
            ].join(' ').toLowerCase();

            const matchesSearch = !searchTerm || searchableText.includes(searchTerm.toLowerCase());

            // Filter by category
            const matchesCategory = !filters.category || complaint.category === filters.category;

            // Filter by date range
            const matchesDateRange = filterByDateRange(complaint, filters.dateRange);

            // Filter by status
            const matchesStatus = !filters.status || complaint.status === filters.status;

            return matchesSearch && matchesCategory && matchesDateRange && matchesStatus;
        });
    }, [resolvedComplaints, searchTerm, filters]);

    const clearFilters = () => {
        setFilters({
            category: '',
            dateRange: '',
            status: ''
        });
        setSearchTerm('');
        setShowFilters(false); // Auto-hide filters after clearing
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

    const validateForm = () => {
        const errors = [];

        if (!feedback.trim()) {
            errors.push('Feedback is required');
        } else if (feedback.trim().length < 10) {
            errors.push('Feedback must be at least 10 characters long');
        }

        if (!rating) {
            errors.push('Please rate your experience');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n' + validationErrors.join('\n'));
            return;
        }

        setSubmitting(true);

        const data = {
            nid: user.nid,
            complaint_id: selectedComplaint.id,
            rating: rating,
            feedback: feedback.trim(),
        };

        try {
            const response = await fetch('http://localhost:8000/backend/feedback.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse feedback response:', text);
                alert('Error submitting feedback. Please try again.');
                return;
            }

            if (result.success) {
                alert(`Thank you for your ${rating}-star feedback! Your input is valuable and will help us improve our services.`);

                // Reset form
                setFeedback('');
                setRating(0);
                setSelectedComplaint(null);

                // Refresh data
                await fetchResolvedComplaints();
                await fetchNotifications();
            } else {
                alert(result.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Network error occurred. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const fetchResolvedComplaints = async () => {
        try {
            const response = await fetch('http://localhost:8000/backend/citizendashboard.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nid: user.nid }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse complaints response:', text);
                return;
            }

            if (data.success) {
                const resolved = (data.complaints || []).filter(complaint =>
                    ['Resolved', 'Closed'].includes(complaint.status)
                );
                setResolvedComplaints(resolved);
            }
        } catch (error) {
            console.error('Error fetching resolved complaints:', error);
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

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse notifications response:', text);
                return;
            }

            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await Promise.all([
                fetchResolvedComplaints(),
                fetchNotifications()
            ]);
            setLoading(false);
        };

        initializeData();

        const complaintId = new URLSearchParams(location.search).get('complaint_id');
        if (complaintId) {
            loadFeedback(complaintId);
            navigate('/feedback', { replace: true });
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && sidebarActive) {
                setSidebarActive(false);
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
    }, [sidebarActive, user?.nid, location.search, navigate]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    Loading feedback page...
                </div>
            </div>
        );
    }

    const navItems = [
        { to: "/citizens-dashboard", text: "Dashboard", icon: "🏠" },
        { to: "/complaint", text: "New Complaint", icon: "📝" },
        { to: "/feedback", text: "Feedback", icon: "💬", active: true },
        { to: "/about", text: "About", icon: "ℹ️" },
        { to: "/help", text: "Help & Contact", icon: "🆘" },
        { to: "#", text: "Logout", icon: "🚪", onClick: handleLogout }
    ];

    const feedbackTips = [
        "Be specific about what worked well or needs improvement",
        "Include details about the resolution process",
        "Your honest rating helps us improve our services",
        "Keep feedback constructive and respectful",
        "Mention if the solution met your expectations",
        "Share any suggestions for better handling in the future"
    ];

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    {navItems.map((item, index) => (
                        <li key={index} className={styles.navItem}>
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
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    onClick={() => loadFeedback(notification.id)}
                                    className={styles.notificationItem}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            loadFeedback(notification.id);
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
                    <h1 className={styles.title}>Provide Feedback</h1>
                    <p className={styles.subtitle}>
                        Your input helps us improve! Share your experience with resolved complaints.
                    </p>

                    <div className={styles.grid}>
                        <div className={styles.complaintSection}>
                            <div className={styles.searchContainer}>
                                <input
                                    type="search"
                                    placeholder="🔍 Search complaints by ID, title, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={styles.filterButton}
                                >
                                    <span>⚙️</span>
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className={styles.filterBadge}>{activeFilterCount}</span>
                                    )}
                                </button>
                            </div>

                            {showFilters && (
                                <div className={styles.filterContainer}>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">All Dates</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                        <option value="year">This Year</option>
                                    </select>

                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">All Statuses</option>
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={clearFilters}
                                        className={styles.clearFilters}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}

                            <ul className={styles.complaintList}>
                                {filteredComplaints.length > 0 ? (
                                    filteredComplaints.map((complaint) => (
                                        <li
                                            key={complaint.id}
                                            onClick={() => loadFeedback(complaint.id)}
                                            className={`${styles.complaintItem} ${selectedComplaint?.id === complaint.id ? styles.complaintItemActive : ''}`}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    loadFeedback(complaint.id);
                                                }
                                            }}
                                        >
                                            <div className={styles.complaintHeader}>
                                                <h3 className={styles.complaintTitle}>
                                                    {complaint.title}
                                                </h3>
                                                <span className={styles.complaintId}>
                                                    #{complaint.id}
                                                </span>
                                            </div>
                                            <p className={styles.complaintDescription}>
                                                {complaint.description?.substring(0, 150)}...
                                            </p>
                                            <div className={styles.complaintMeta}>
                                                <span>📅 {complaint.created_at}</span>
                                                <span>📍 {complaint.location}</span>
                                                <span>🏷️ {complaint.category}</span>
                                                <span className={styles.statusBadge}>
                                                    {complaint.status}
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <div className={styles.noComplaints}>
                                        No resolved complaints found. Submit a new complaint from the dashboard.
                                    </div>
                                )}
                            </ul>
                        </div>

                        <div className={styles.feedbackSection}>
                            {selectedComplaint ? (
                                <div>
                                    <h2 className={styles.sectionTitle}>
                                        Feedback for Complaint #{selectedComplaint.id}
                                    </h2>
                                    <p className={styles.sectionSubtitle}>
                                        {selectedComplaint.title}
                                    </p>
                                    <form onSubmit={handleSubmit} className={styles.form}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                ⭐ Rate Your Experience:
                                            </label>
                                            <div className={styles.stars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        onClick={() => handleStarClick(star)}
                                                        className={`${styles.star} ${star <= rating ? styles.starFilled : ''} ${animateRating && star <= rating ? styles.starAnimated : ''}`}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                handleStarClick(star);
                                                            }
                                                        }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <div className={styles.ratingLegend}>
                                                <h4>Rating Guide:</h4>
                                                <p>1 ★ - Very Dissatisfied</p>
                                                <p>5 ★ - Very Satisfied</p>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="feedback" className={styles.label}>
                                                💭 Your Feedback:
                                            </label>
                                            <textarea
                                                id="feedback"
                                                name="feedback"
                                                rows="5"
                                                required
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                placeholder="Share your experience with our complaint resolution process. What worked well? What could we improve?"
                                                className={styles.textarea}
                                                minLength={10}
                                                maxLength={1000}
                                            />
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: feedback.length < 10 ? '#ef4444' : '#9ca3af',
                                                marginTop: '0.25rem'
                                            }}>
                                                {feedback.length}/1000 characters (minimum 10)
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className={styles.submitButton}
                                            disabled={submitting || !rating || feedback.length < 10}
                                            style={{
                                                opacity: submitting || !rating || feedback.length < 10 ? 0.6 : 1,
                                                cursor: submitting || !rating || feedback.length < 10 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span>⏳</span>
                                                    <span>Submitting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>🚀</span>
                                                    <span>Submit Feedback</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className={styles.noSelection}>
                                    <h2 className={styles.sectionTitle}>
                                        Select a Complaint
                                    </h2>
                                    <p className={styles.sectionSubtitle}>
                                        Choose a resolved complaint from the list to provide feedback.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Tips Section */}
                        <div className={styles.tipsSection}>
                            <h3 className={styles.tipsTitle}>
                                💡 Tips for Effective Feedback
                            </h3>
                            <ul className={styles.tipsList}>
                                {feedbackTips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>

                            {/* Search and Filter Tips */}
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #0ea5e9',
                                borderRadius: '0.5rem'
                            }}>
                                <h4 style={{
                                    margin: '0 0 0.5rem 0',
                                    color: '#0c4a6e',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    🔍 Search & Filter Tips:
                                </h4>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '1.2rem',
                                    fontSize: '0.85rem',
                                    color: '#0c4a6e'
                                }}>
                                    <li>Use the search bar to quickly find complaints by ID, title, or keywords</li>
                                    <li>Filter by category to focus on specific types of issues</li>
                                    <li>Use date ranges to find recent or older complaints</li>
                                    <li>Combine multiple filters for precise results</li>
                                    <li>Use keyboard shortcuts for faster navigation</li>
                                </ul>
                            </div>
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

export default CitizenFeedbackPage;