import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/governmentdashboard.module.css';

const GovernmentDashboard = ({ user, handleLogout }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [officialInfo, setOfficialInfo] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Available filter options based on your database schema
  const categories = [
    'Public Infrastructure', 'Waste Management', 'Traffic and Transport',
    'Health and Safety', 'Environment and Pollution', 'Education',
    'Law and Order', 'Utilities', 'Corruption and Governance',
    'Housing and Urban Development'
  ];

  const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'On Hold'];
  const priorities = ['High', 'Medium', 'Low'];

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const viewComplaint = (complaintId) => {
    navigate(`/solution?complaint_id=${complaintId}`);
  };

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return styles.statusResolved;
      case 'pending':
        return styles.statusPending;
      case 'in progress':
        return styles.statusInProgress;
      default:
        return styles.statusDefault;
    }
  };

  // Enhanced search and filter function
  const filterComplaints = () => {
    let filtered = [...complaints];

    // Text-based search (ID, title, description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.id.toString().includes(term) ||
        complaint.title?.toLowerCase().includes(term) ||
        complaint.description?.toLowerCase().includes(term) ||
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
        toDate.setHours(23, 59, 59, 999); // Include the entire day
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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({ from: '', to: '' });
    setCategoryFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setFilteredComplaints(complaints);
  };

  // Apply filters whenever search term or filters change
  useEffect(() => {
    filterComplaints();
  }, [searchTerm, dateFilter, categoryFilter, statusFilter, priorityFilter, complaints]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/backend/get_government_dashboard.php', {
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
          console.error('Failed to parse dashboard response:', text);
          alert('Error fetching dashboard data. Please try again.');
          return;
        }
        if (data.success) {
          setOfficialInfo(data.officialInfo);
          setComplaints(data.complaints);
          setFilteredComplaints(data.complaints); // Initialize filtered complaints
          setNotifications(data.notifications);
        } else {
          console.error('Failed to fetch dashboard data:', data.message);
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching dashboard data. Please try again.');
      }
    };

    fetchData();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && sidebarActive) {
        setSidebarActive(false);
      }
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        toggleSidebar();
      }
      // Quick search shortcut
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
  }, [sidebarActive, user.nid]);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <ul className={styles.navList}>
          {[
            { to: "/government-dashboard", text: "🏠 Dashboard", active: true },
            { to: "/solution", text: "🔧 Resolve Complaints" },
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
                onClick={() => viewComplaint(notification.id)}
                className={styles.notificationItem}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    viewComplaint(notification.id);
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
          <h1 className={styles.title}>Government Official Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome, {officialInfo.name}! Manage and resolve complaints assigned to you in {officialInfo.zone}.
          </p>

          <div className={styles.sections}>
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>Official Profile</h2>
              <ul className={styles.profileList}>
                {[
                  { label: "Name:", value: officialInfo.name },
                  { label: "Official Type:", value: officialInfo.officialType || 'N/A' }, // Added Official Type
                  { label: "Zone:", value: officialInfo.zone },
                  { label: "Assigned Complaints:", value: officialInfo.assignedComplaints },
                  { label: "Solved Complaints:", value: officialInfo.solvedComplaints },
                  { label: "Pending Complaints:", value: officialInfo.pendingComplaints },
                  { label: "In Progress Complaints:", value: officialInfo.inProgressComplaints }
                ].map((item, index) => (
                  <li key={index} className={styles.profileItem}>
                    <strong className={styles.profileLabel}>{item.label}</strong>
                    {item.value}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.complaintsSection}>
              <div className={styles.complaintsSectionHeader}>
                <h2 className={styles.sectionTitle}>Assigned Complaints</h2>
                <div className={styles.searchAndFilterContainer}>
                  {/* Search Bar */}
                  <div className={styles.searchContainer}>
                    <input
                      id="search-input"
                      type="text"
                      placeholder="🔍 Search by ID, title, description, citizen name, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={styles.filterToggleButton}
                    title="Toggle Filters"
                  >
                    🎛️ Filters {showFilters ? '▲' : '▼'}
                  </button>

                  {/* Clear Filters Button */}
                  {(searchTerm || dateFilter.from || dateFilter.to || categoryFilter || statusFilter || priorityFilter) && (
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

              {/* Advanced Filters Panel */}
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
                        <option value="">All Statuses</option>
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

              {/* Results Summary */}
              <div className={styles.resultsInfo}>
                <span className={styles.resultsCount}>
                  Showing {filteredComplaints.length} of {complaints.length} complaints
                </span>
                {(searchTerm || dateFilter.from || dateFilter.to || categoryFilter || statusFilter || priorityFilter) && (
                  <span className={styles.activeFiltersIndicator}>
                    (Filtered)
                  </span>
                )}
              </div>

              <div className={styles.complaintsContainer}>
                {filteredComplaints.length === 0 ? (
                  <div className={styles.noResults}>
                    <p>🔍 No complaints found matching your search criteria.</p>
                    {(searchTerm || dateFilter.from || dateFilter.to || categoryFilter || statusFilter || priorityFilter) && (
                      <button onClick={clearFilters} className={styles.clearFiltersLink}>
                        Clear filters to see all complaints
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className={styles.complaintsList}>
                    {filteredComplaints.map((complaint) => (
                      <li
                        key={complaint.id}
                        onClick={() => viewComplaint(complaint.id)}
                        className={styles.complaintItem}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            viewComplaint(complaint.id);
                          }
                        }}
                      >
                        <div className={styles.complaintHeader}>
                          <strong>Complaint #{complaint.id}</strong> - {complaint.category}
                          {complaint.priority && (
                            <span className={`${styles.priorityBadge} ${styles[`priority${complaint.priority}`]}`}>
                              {complaint.priority}
                            </span>
                          )}
                        </div>
                        <div className={styles.complaintTitle}>
                          {complaint.title}
                        </div>
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
            </div>

            <div className={styles.ctaSection}>
              <h3 className={styles.ctaTitle}>🚀 Ready to Resolve Complaints?</h3>
              <p className={styles.ctaText}>
                Review and address complaints assigned to you to improve community services.
              </p>
              <Link
                to="/solution"
                className={styles.ctaButton}
              >
                🔧 Resolve Complaints
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Building Better Communities Together &copy; Team SM 2025 | All rights not yet reserved.
        </p>
      </footer>
    </div>
  );
};

export default GovernmentDashboard;