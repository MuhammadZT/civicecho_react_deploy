// Updated CitizenDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/citizendashboard.module.css';

const CitizenDashboard = ({ user, handleLogout }) => {
    const navigate = useNavigate();
    const [sidebarActive, setSidebarActive] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [profile, setProfile] = useState({
        nid: user?.nid || 'BD123456789',
        name: user?.name || 'User',
        role: 'Citizen',
        memberSince: 'January 2024',
        totalComplaints: 0
    });

    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const updateGreeting = () => {
        const hours = new Date().getHours();
        const greetings = {
            morning: {
                title: "Good Morning!",
                message: `Welcome back, ${profile.name}. Ready to start a productive day?`
            },
            afternoon: {
                title: "Good Afternoon!",
                message: `Welcome back, ${profile.name}. Hope you're having a great day!`
            },
            evening: {
                title: "Good Evening!",
                message: `Welcome back, ${profile.name}. Winding down for the day?`
            },
            night: {
                title: "Good Night!",
                message: `Welcome back, ${profile.name}. At this hour?! Let's make the most of it!`
            }
        };

        let timeOfDay;
        if (hours < 12) timeOfDay = 'morning';
        else if (hours < 17) timeOfDay = 'afternoon';
        else if (hours < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';

        setGreeting(greetings[timeOfDay].title);
        setWelcomeMessage(greetings[timeOfDay].message);
    };

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const goToFeedbackPage = (complaintId) => {
        navigate('/feedback', { state: { complaintId } });
    };

    const goToEditPage = (complaintId) => {
        navigate(`/edit-complaint?complaint_id=${complaintId}`);
    };

    const fetchUserComplaints = async () => {
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
                console.error('Failed to parse user complaints response:', text);
                return;
            }

            if (data.success) {
                setComplaints(data.complaints);
                setProfile(prev => ({
                    ...prev,
                    ...data.profile
                }));
            }
        } catch (error) {
            console.error('Error fetching user complaints:', error);
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
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleCancel = async (complaintId) => {
        if (!window.confirm('Are you sure you want to cancel and permanently delete this complaint? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/backend/cancel_complaint.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nid: user.nid, complaint_id: complaintId }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Complaint cancelled and removed successfully.');
                await fetchUserComplaints();
                await fetchNotifications();
            } else {
                alert(`Failed to cancel: ${data.message}`);
            }
        } catch (error) {
            console.error('Error cancelling complaint:', error);
            alert('An error occurred while cancelling the complaint.');
        }
    };

    const filterComplaints = () => {
        let filtered = [...complaints];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(complaint =>
                complaint.id.toString().includes(searchLower) ||
                complaint.title.toLowerCase().includes(searchLower) ||
                (complaint.description && complaint.description.toLowerCase().includes(searchLower))
            );
        }

        if (dateFilter) {
            const today = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(complaint => {
                        const complaintDate = new Date(complaint.created_at);
                        return complaintDate >= filterDate;
                    });
                    break;
                case 'week':
                    filterDate.setDate(today.getDate() - 7);
                    filtered = filtered.filter(complaint => {
                        const complaintDate = new Date(complaint.created_at);
                        return complaintDate >= filterDate;
                    });
                    break;
                case 'month':
                    filterDate.setMonth(today.getMonth() - 1);
                    filtered = filtered.filter(complaint => {
                        const complaintDate = new Date(complaint.created_at);
                        return complaintDate >= filterDate;
                    });
                    break;
                case 'year':
                    filterDate.setFullYear(today.getFullYear() - 1);
                    filtered = filtered.filter(complaint => {
                        const complaintDate = new Date(complaint.created_at);
                        return complaintDate >= filterDate;
                    });
                    break;
            }
        }

        if (typeFilter) {
            filtered = filtered.filter(complaint =>
                complaint.issue.toLowerCase() === typeFilter.toLowerCase()
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(complaint =>
                complaint.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);

            switch (sortBy) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

        setFilteredComplaints(filtered);
    };

    const getUniqueTypes = () => {
        return [...new Set(complaints.map(c => c.issue))].sort();
    };

    const getUniqueStatuses = () => {
        return [...new Set(complaints.map(c => c.status))].sort();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter('');
        setTypeFilter('');
        setStatusFilter('');
        setSortBy('newest');
    };

    useEffect(() => {
        updateGreeting();
        fetchUserComplaints();
        fetchNotifications();
        setLoading(false);
    }, []);

    useEffect(() => {
        filterComplaints();
    }, [complaints, searchTerm, dateFilter, typeFilter, statusFilter, sortBy]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Navigation Bar */}
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    <li className={styles.navItem}>
                        <Link to="/citizens-dashboard" className={`${styles.navLink} ${styles.navLinkActive}`}>
                            🏠 Dashboard
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/complaint" className={styles.navLink}>
                            📝 New Complaint
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/feedback" className={styles.navLink}>
                            💬 Feedback
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/about" className={styles.navLink}>
                            ℹ️ About
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/help" className={styles.navLink}>
                            🆘 Help & Contact
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="#" className={styles.navLink} onClick={handleLogout}>
                            🚪 Logout
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Notification Toggle Button */}
            <button id="toggle-notifications" onClick={toggleSidebar} className={styles.notificationToggle}>
                {sidebarActive ? '🔔' : '🔔'}
            </button>

            {/* Sidebar */}
            <div id="notification-sidebar" className={`${styles.sidebar} ${sidebarActive ? styles.sidebarActive : ''}`}>
                <button onClick={toggleSidebar} className={styles.closeSidebar}>×</button>
                <h3 className={styles.sidebarTitle}>Notifications</h3>
                <div className={styles.sidebarContent}>
                    {notifications.length > 0 ? (
                        <div className={styles.notificationsList}>
                            {notifications.map((notification) => (
                                <div key={notification.id} className={styles.notificationItem}>
                                    <div className={styles.notificationIcon}>{notification.icon}</div>
                                    <div className={styles.notificationContent}>
                                        <p>{notification.message}</p>
                                        <small>{new Date(notification.date).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noNotifications}>
                            No notifications available
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentContainer}>
                    {/* Header */}
                    <header className={styles.header}>
                        <h1 className={styles.greeting}>{greeting}</h1>
                        <p className={styles.welcomeMessage}>{welcomeMessage}</p>
                    </header>

                    {/* Profile Section */}
                    <section className={styles.profileSection}>
                        <h2 className={styles.sectionTitle}>Your Profile</h2>
                        <div className={styles.profileCard}>
                            <div className={styles.profileInfo}>
                                <h3>{profile.name}</h3>
                                <p>NID: {profile.nid}</p>
                                <p>Role: {profile.role}</p>
                                <p>Member Since: {profile.memberSince}</p>
                                <p>Total Complaints: {profile.totalComplaints}</p>
                            </div>
                        </div>
                    </section>

                    {/* Complaints Section */}
                    <section className={styles.complaintsSection}>
                        <h2 className={styles.sectionTitle}>Your Complaints</h2>

                        {/* Filters */}
                        <div className={styles.filtersContainer}>
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />

                            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={styles.filterSelect}>
                                <option value="">All Dates</option>
                                <option value="today">Today</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="year">Last Year</option>
                            </select>

                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={styles.filterSelect}>
                                <option value="">All Types</option>
                                {getUniqueTypes().map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                                <option value="">All Status</option>
                                {getUniqueStatuses().map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.filterSelect}>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">By Title</option>
                                <option value="status">By Status</option>
                            </select>

                            {(searchTerm || dateFilter || typeFilter || statusFilter || sortBy !== 'newest') && (
                                <button onClick={clearFilters} className={styles.clearFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Complaints List */}
                        <div className={styles.complaintsContainer}>
                            {filteredComplaints.length > 0 ? (
                                <div className={styles.complaintsList}>
                                    {filteredComplaints.map((complaint) => (
                                        <div
                                            key={complaint.id}
                                            className={styles.complaintCard}
                                            onClick={() => goToFeedbackPage(complaint.id)}
                                        >
                                            <div className={styles.complaintHeader}>
                                                <div className={styles.complaintMeta}>
                                                    <span className={styles.complaintId}>ID: {complaint.id}</span>
                                                    <span className={`${styles.complaintStatus} ${styles[`status${complaint.status.replace(/\s+/g, '')}`]}`}>
                                                        {complaint.status}
                                                    </span>
                                                </div>
                                                <h3 className={styles.complaintTitle}>{complaint.title}</h3>
                                            </div>
                                            <div className={styles.complaintDetails}>
                                                <p>Issue: {complaint.issue} | {complaint.timeAgo}</p>
                                                {complaint.description && (
                                                    <p className={styles.complaintDescription}>
                                                        {complaint.description.length > 100
                                                            ? `${complaint.description.substring(0, 100)}...`
                                                            : complaint.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            {complaint.status === 'Pending' && (
                                                <div className={styles.complaintActions}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCancel(complaint.id);
                                                        }}
                                                        className={styles.cancelBtn}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noComplaints}>
                                    {complaints.length === 0
                                        ? "No complaints submitted yet"
                                        : "No complaints match your search criteria"
                                    }
                                    {(searchTerm || dateFilter || typeFilter || statusFilter) && (
                                        <button onClick={clearFilters} className={styles.clearFiltersLink}>
                                            Clear filters to see all complaints
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className={styles.ctaSection}>
                        <h3>Ready to report a new issue?</h3>
                        <p>Your voice matters. Help improve your community by reporting issues.</p>
                        <button onClick={() => navigate('/complaint')} className={styles.ctaButton}>
                            Submit New Complaint
                        </button>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>Building Better Communities Together © Team SM 2025</p>
            </footer>
        </div>
    );
};

export default CitizenDashboard;