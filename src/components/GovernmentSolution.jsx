import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/governmentsolution.module.css';

const GovernmentSolution = ({ user, handleLogout }) => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [solution, setSolution] = useState('');
    const [status, setStatus] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Available filter options
    const categories = [
        'Public Infrastructure', 'Waste Management', 'Traffic and Transport',
        'Health and Safety', 'Environment and Pollution', 'Education',
        'Law and Order', 'Utilities', 'Corruption and Governance',
        'Housing and Urban Development'
    ];

    // Only show unresolved statuses for filtering
    const statuses = ['Pending', 'In Progress', 'On Hold'];
    const priorities = ['High', 'Medium', 'Low'];

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const loadComplaint = async (complaintId) => {
        try {
            const response = await fetch('http://localhost:8000/backend/get_complaints_details.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nid: user.nid, complaint_id: complaintId }),
            });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse complaint details response:', text);
                alert('Error fetching complaint details. Please try again.');
                return;
            }
            if (data.success) {
                setSelectedComplaint(data.complaint);
                setSolution(data.complaint.solution || '');
                setStatus(data.complaint.status || '');
            } else {
                console.error('Failed to fetch complaint details:', data.message);
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching complaint details:', error);
            alert('An error occurred while fetching complaint details. Please try again.');
        }
    };

    // Check if solution is required based on status
    const isSolutionRequired = (selectedStatus) => {
        return ['Resolved', 'Closed'].includes(selectedStatus);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only require solution for Resolved/Closed status
        if (isSolutionRequired(status) && !solution.trim()) {
            alert('Please provide a solution when marking complaint as Resolved or Closed.');
            return;
        }

        if (!status) {
            alert('Please select a status before submitting.');
            return;
        }

        const data = {
            nid: user.nid,
            complaint_id: selectedComplaint.id,
            solution: solution.trim() || null,
            status: status
        };

        try {
            const response = await fetch('http://localhost:8000/backend/solution.php', {
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
                console.error('Failed to parse solution response:', text);
                alert('Error submitting update. Please try again.');
                return;
            }
            if (result.success) {
                alert(`Complaint #${selectedComplaint.id} updated successfully!`);
                setSolution('');
                setStatus('');
                setSelectedComplaint(null);
                fetchData();
                navigate('/solution'); // Reset URL
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error submitting update:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved':
                return styles.statusResolved;
            case 'pending':
                return styles.statusPending;
            case 'in progress':
                return styles.statusInProgress;
            case 'on hold':
                return styles.statusOnHold;
            default:
                return styles.statusDefault;
        }
    };

    const isImage = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    };

    const filterComplaints = () => {
        let filtered = [...complaints];

        // Only show unresolved complaints (filter out Resolved and Closed)
        filtered = filtered.filter(complaint =>
            !['resolved', 'closed'].includes(complaint.status.toLowerCase())
        );

        // Text-based search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(complaint =>
                complaint.id.toString().includes(term) ||
                complaint.category.toLowerCase().includes(term) ||
                complaint.citizenName?.toLowerCase().includes(term) ||
                complaint.location?.toLowerCase().includes(term)
            );
        }

        // Date range filter
        if (dateFilter.from) {
            filtered = filtered.filter(complaint => {
                const complaintDate = new Date(complaint.created_at);
                const fromDate = new Date(dateFilter.from);
                return complaintDate >= fromDate;
            });
        }

        if (dateFilter.to) {
            filtered = filtered.filter(complaint => {
                const complaintDate = new Date(complaint.created_at);
                const toDate = new Date(dateFilter.to);
                toDate.setHours(23, 59, 59, 999);
                return complaintDate <= toDate;
            });
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(complaint =>
                complaint.category === categoryFilter
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(complaint =>
                complaint.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Priority filter
        if (priorityFilter) {
            filtered = filtered.filter(complaint =>
                complaint.priority?.toLowerCase() === priorityFilter.toLowerCase()
            );
        }

        setFilteredComplaints(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter({ from: '', to: '' });
        setCategoryFilter('');
        setStatusFilter('Pending');
        setPriorityFilter('');
    };

    const fetchData = async () => {
        try {
            const dashboardResponse = await fetch('http://localhost:8000/backend/get_government_dashboard.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nid: user.nid }),
            });
            const dashboardText = await dashboardResponse.text();
            let dashboardData;
            try {
                dashboardData = JSON.parse(dashboardText);
            } catch (e) {
                console.error('Failed to parse dashboard response:', dashboardText);
                alert('Error fetching dashboard data. Please try again.');
                return;
            }
            if (dashboardData.success) {
                setComplaints(dashboardData.complaints);
                setNotifications(dashboardData.notifications);
                // Filter to show only unresolved complaints by default
                const unresolvedComplaints = dashboardData.complaints.filter(complaint =>
                    !['resolved', 'closed'].includes(complaint.status.toLowerCase())
                );
                setFilteredComplaints(unresolvedComplaints.filter(complaint =>
                    complaint.status.toLowerCase() === 'pending'
                ));
            } else {
                console.error('Failed to fetch dashboard data:', dashboardData.message);
                alert('Failed to fetch dashboard data: ' + dashboardData.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('An error occurred while fetching dashboard data. Please try again.');
        }
    };

    useEffect(() => {
        filterComplaints();
    }, [searchTerm, dateFilter, categoryFilter, statusFilter, priorityFilter, complaints]);

    useEffect(() => {
        fetchData();

        const params = new URLSearchParams(location.search);
        const complaintId = params.get('complaint_id');
        if (complaintId) {
            loadComplaint(complaintId);
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && sidebarActive) {
                setSidebarActive(false);
            }
            if (event.ctrlKey && event.key === 'n') {
                event.preventDefault();
                toggleSidebar();
            }
            if (event.ctrlKey && event.key === 'f') {
                event.preventDefault();
                document.getElementById('search-input')?.focus();
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
                !closeButton?.contains(event.target)
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
    }, [sidebarActive, location, user.nid]);

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <ul className={styles.navList}>
                    {[
                        { to: "/government-dashboard", text: "🏠 Dashboard" },
                        { to: "/solution", text: "🔧 Resolve Complaints", active: true },
                        { to: "/about", text: "ℹ️ About" },
                        { to: "/help", text: "🆘 Help & Contact" },
                        { to: "#", text: "🚪 Logout", onClick: handleLogout }
                    ].map((item, index) => (
                        <li key={index} className={styles.navItem}>
                            <Link
                                to={item.to}
                                onClick={item.onClick}
                                className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
                            >
                                {item.text}
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
                >
                    🔔
                </button>

                <aside
                    id="notification-sidebar"
                    className={`${styles.sidebar} ${sidebarActive ? styles.sidebarActive : ''}`}
                >
                    <button
                        onClick={toggleSidebar}
                        className={styles.closeSidebar}
                    >
                        ✕
                    </button>
                    <h2 className={styles.sidebarTitle}>Notifications</h2>
                    <ul className={styles.notificationList}>
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                onClick={() => loadComplaint(notification.id)}
                                className={styles.notificationItem}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        loadComplaint(notification.id);
                                    }
                                }}
                            >
                                <span className={styles.notificationType}>{notification.icon} {notification.type}</span>
                                <p className={styles.notificationMessage}>{notification.message}</p>
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className={styles.content}>
                    <h1 className={styles.title}>🔧 Resolve Complaints</h1>
                    <p className={styles.subtitle}>
                        Review and update status for unresolved complaints in your zone.
                    </p>

                    <div className={styles.sections}>
                        <div className={styles.grid}>
                            <div className={styles.complaintSection}>
                                <div className={styles.complaintsSectionHeader}>
                                    <h2 className={styles.sectionTitle}>Unresolved Complaints</h2>
                                    <div className={styles.searchAndFilterContainer}>
                                        <div className={styles.searchContainer}>
                                            <input
                                                id="search-input"
                                                type="text"
                                                placeholder="🔍 Search by ID, category, citizen name, or location..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className={styles.searchInput}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={styles.filterToggleButton}
                                            title="Toggle Filters"
                                        >
                                            🎛️ Filters {showFilters ? '▲' : '▼'}
                                        </button>
                                        {(searchTerm || dateFilter.from || dateFilter.to || categoryFilter || statusFilter !== 'Pending' || priorityFilter) && (
                                            <button
                                                onClick={clearFilters}
                                                className={styles.clearFiltersButton}
                                                title="Clear All Filters"
                                            >
                                                🗑️ Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showFilters && (
                                    <div className={styles.filtersPanel}>
                                        <div className={styles.filterRow}>
                                            <div className={styles.filterGroup}>
                                                <label className={styles.filterLabel}>📅 Date Range:</label>
                                                <div className={styles.dateRangeContainer}>
                                                    <input
                                                        type="date"
                                                        value={dateFilter.from}
                                                        onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                                                        className={styles.dateInput}
                                                        title="From Date"
                                                    />
                                                    <span className={styles.dateSeparator}>to</span>
                                                    <input
                                                        type="date"
                                                        value={dateFilter.to}
                                                        onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                                                        className={styles.dateInput}
                                                        title="To Date"
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.filterGroup}>
                                                <label className={styles.filterLabel}>📂 Category:</label>
                                                <select
                                                    value={categoryFilter}
                                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                                    className={styles.filterSelect}
                                                >
                                                    <option value="">All Categories</option>
                                                    {categories.map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.filterRow}>
                                            <div className={styles.filterGroup}>
                                                <label className={styles.filterLabel}>📊 Status:</label>
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className={styles.filterSelect}
                                                >
                                                    <option value="">All Unresolved</option>
                                                    {statuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className={styles.filterGroup}>
                                                <label className={styles.filterLabel}>⚡ Priority:</label>
                                                <select
                                                    value={priorityFilter}
                                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                                    className={styles.filterSelect}
                                                >
                                                    <option value="">All Priorities</option>
                                                    {priorities.map(priority => (
                                                        <option key={priority} value={priority}>{priority}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.resultsInfo}>
                                    <span className={styles.resultsCount}>
                                        Showing {filteredComplaints.length} unresolved complaints
                                    </span>
                                    {(searchTerm || dateFilter.from || dateFilter.to || categoryFilter || statusFilter !== 'Pending' || priorityFilter) && (
                                        <span className={styles.activeFiltersIndicator}>
                                            (Filtered)
                                        </span>
                                    )}
                                </div>

                                {filteredComplaints.length === 0 ? (
                                    <div className={styles.noResults}>
                                        <p>🔍 No unresolved complaints found matching your search criteria.</p>
                                        {(searchTerm || dateFilter.from || dateFilter.to || categoryFilter || statusFilter !== 'Pending' || priorityFilter) && (
                                            <button onClick={clearFilters} className={styles.clearFiltersLink}>
                                                Clear filters to see all unresolved complaints
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <ul className={styles.complaintList}>
                                        {filteredComplaints.map((complaint) => (
                                            <li
                                                key={complaint.id}
                                                onClick={() => loadComplaint(complaint.id)}
                                                className={`${styles.complaintItem} ${selectedComplaint && selectedComplaint.id === complaint.id ? styles.complaintItemSelected : ''}`}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        loadComplaint(complaint.id);
                                                    }
                                                }}
                                            >
                                                <strong>Complaint #{complaint.id}</strong> - {complaint.category}
                                                {complaint.priority && (
                                                    <span className={`${styles.priorityBadge} ${styles[`priority${complaint.priority}`]}`}>
                                                        {complaint.priority}
                                                    </span>
                                                )}
                                                <br />
                                                <small className={styles.complaintDetails}>
                                                    By {complaint.citizenName} | {complaint.location} |
                                                    <span className={getStatusStyles(complaint.status)}>
                                                        {complaint.status}
                                                    </span>
                                                    {complaint.created_at && (
                                                        <span className={styles.complaintDate}>
                                                            | {new Date(complaint.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {selectedComplaint && (
                                <div className={styles.solutionSection}>
                                    <h2 className={styles.sectionTitle}>
                                        Complaint #{selectedComplaint.id} Details
                                    </h2>
                                    <div className={styles.form}>
                                        <div className={styles.formGroup}>
                                            <p className={styles.complaintInfo}>
                                                <strong>Citizen:</strong> {selectedComplaint.citizenName}
                                            </p>
                                            <p className={styles.complaintInfo}>
                                                <strong>Category:</strong> {selectedComplaint.category}
                                            </p>
                                            <p className={styles.complaintInfo}>
                                                <strong>Location:</strong> {selectedComplaint.location}
                                            </p>
                                            <p className={styles.complaintInfo}>
                                                <strong>Description:</strong> {selectedComplaint.description}
                                            </p>
                                            <p className={styles.complaintInfo}>
                                                <strong>Current Status:</strong>
                                                <span className={getStatusStyles(selectedComplaint.status)}>
                                                    {selectedComplaint.status}
                                                </span>
                                            </p>
                                            <p className={styles.complaintInfo}>
                                                <strong>Zone:</strong> {selectedComplaint.zone}
                                            </p>
                                            {selectedComplaint.solution && (
                                                <p className={styles.complaintInfo}>
                                                    <strong>Current Solution:</strong> {selectedComplaint.solution}
                                                </p>
                                            )}
                                            {selectedComplaint.feedback && (
                                                <p className={styles.complaintInfo}>
                                                    <strong>Citizen Feedback:</strong> {selectedComplaint.feedback}
                                                </p>
                                            )}
                                            {selectedComplaint.rating && (
                                                <p className={styles.complaintInfo}>
                                                    <strong>Rating:</strong> {selectedComplaint.rating} / 5
                                                </p>
                                            )}
                                            <h3 className={styles.sectionTitle}>Attachments</h3>
                                            <ul className={styles.attachmentList}>
                                                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 ? (
                                                    selectedComplaint.attachments.map((filePath, index) => (
                                                        <li key={index}>
                                                            {isImage(filePath) ? (
                                                                <img
                                                                    src={`http://localhost:8000/${filePath}`}
                                                                    alt={`Attachment ${index + 1}`}
                                                                    className={styles.attachmentPreview}
                                                                />
                                                            ) : (
                                                                <span>No preview available</span>
                                                            )}
                                                            <a
                                                                href={`http://localhost:8000/${filePath}`}
                                                                download
                                                                className={styles.attachmentLink}
                                                            >
                                                                Download Attachment {index + 1}
                                                            </a>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>No attachments available</li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="status" className={styles.label}>Update Status:</label>
                                            <select
                                                id="status"
                                                name="status"
                                                required
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className={styles.select}
                                            >
                                                <option value="">Select Status</option>
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="solution" className={styles.label}>
                                                {isSolutionRequired(status) ? 'Solution (Required):' : 'Solution/Update (Optional):'}
                                            </label>
                                            <textarea
                                                id="solution"
                                                name="solution"
                                                rows="5"
                                                required={isSolutionRequired(status)}
                                                value={solution}
                                                onChange={(e) => setSolution(e.target.value)}
                                                placeholder={
                                                    isSolutionRequired(status)
                                                        ? "Describe the solution provided to resolve this complaint..."
                                                        : "Add any updates or notes (optional)..."
                                                }
                                                className={styles.textarea}
                                            />
                                            {isSolutionRequired(status) && (
                                                <small className={styles.fieldNote}>
                                                    * Solution is required when marking complaint as Resolved or Closed
                                                </small>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            onClick={handleSubmit}
                                            className={styles.submitButton}
                                        >
                                            Update Complaint
                                        </button>
                                    </div>
                                </div>
                            )}
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

export default GovernmentSolution;