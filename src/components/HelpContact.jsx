import { Link } from 'react-router-dom';
import styles from '../styles/helpcontact.module.css';

const HelpContact = ({ user, handleLogout }) => {
    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navWrapper}>
                    <div className={styles.logo}>
                        <span className={styles.logoText}>CivicEcho</span>
                    </div>
                    <ul className={styles.navList}>
                        {[
                            { to: "/citizens-dashboard", text: "Dashboard", icon: "🏠" },
                            { to: "/complaint", text: "New Complaint", icon: "📝" },
                            { to: "/feedback", text: "Feedback", icon: "💬" },
                            { to: "/about", text: "About", icon: "ℹ️" },
                            { to: "/help", text: "Help & Contact", icon: "🆘", active: true },
                            { to: "#", text: "Logout", icon: "🚪", onClick: handleLogout }
                        ].map((item, index) => (
                            <li key={index} className={styles.navItem}>
                                <Link
                                    to={item.to}
                                    onClick={item.onClick}
                                    className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navText}>{item.text}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.title}>Help & Contact</h1>
                        <p className={styles.subtitle}>
                            We're here to assist you with any questions or issues you may have
                        </p>
                        <div className={styles.heroDecoration}></div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.sections}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>❓</div>
                                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                            </div>
                            <div className={styles.faqContainer}>
                                {[
                                    {
                                        question: "How do I submit a complaint?",
                                        answer: "Log in to your account, navigate to the 'New Complaint' page, fill in the required details, and submit. You'll receive a confirmation notification instantly.",
                                        icon: "📝"
                                    },
                                    {
                                        question: "How can I track my complaint status?",
                                        answer: "Visit your dashboard to see the real-time status of all your complaints. You'll also receive push notifications on any updates or changes.",
                                        icon: "📊"
                                    },
                                    {
                                        question: "What if I forget my password?",
                                        answer: "Use the 'Forgot Password' link on the login page to reset your password via email verification or OTP sent to your registered phone number.",
                                        icon: "🔐"
                                    },
                                    {
                                        question: "How do I provide feedback on a resolved complaint?",
                                        answer: "Once a complaint is marked as resolved, you'll receive a notification. Click on it or go to the 'Feedback' page to rate the resolution and provide comments.",
                                        icon: "⭐"
                                    },
                                    {
                                        question: "Is my data secure?",
                                        answer: "Absolutely! We use industry-standard encryption, secure servers, and follow strict data protection protocols to safeguard your personal information and complaints.",
                                        icon: "🔒"
                                    },
                                    {
                                        question: "Can I attach files to my complaint?",
                                        answer: "Yes, you can attach images, documents, and other relevant files to support your complaint. Multiple file formats are supported for your convenience.",
                                        icon: "📎"
                                    }
                                ].map((faq, index) => (
                                    <div key={index} className={styles.faqItem}>
                                        <div className={styles.faqHeader}>
                                            <span className={styles.faqIcon}>{faq.icon}</span>
                                            <h3 className={styles.faqQuestion}>{faq.question}</h3>
                                        </div>
                                        <p className={styles.faqAnswer}>{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>📞</div>
                                <h2 className={styles.sectionTitle}>Get in Touch</h2>
                            </div>
                            <div className={styles.contactGrid}>
                                <div className={styles.contactCard}>
                                    <div className={styles.contactCardIcon}>📧</div>
                                    <h3 className={styles.contactCardTitle}>Email Support</h3>
                                    <p className={styles.contactCardInfo}>saima.aktherzt@gmail.com</p>
                                    <p className={styles.contactCardDescription}>We typically respond within 24 hours</p>
                                </div>
                                <div className={styles.contactCard}>
                                    <div className={styles.contactCardIcon}>📱</div>
                                    <h3 className={styles.contactCardTitle}>Phone Support</h3>
                                    <p className={styles.contactCardInfo}>+880-171-5947818</p>
                                    <p className={styles.contactCardDescription}>Available Mon-Fri, 9 AM - 6 PM</p>
                                </div>
                                <div className={styles.contactCard}>
                                    <div className={styles.contactCardIcon}>📍</div>
                                    <h3 className={styles.contactCardTitle}>Visit Us</h3>
                                    <p className={styles.contactCardInfo}>North South University</p>
                                    <p className={styles.contactCardDescription}>Bashundhara R/A, Dhaka, Bangladesh</p>
                                </div>
                            </div>

                            <div className={styles.emergencyContact}>
                                <div className={styles.emergencyIcon}>🚨</div>
                                <div className={styles.emergencyContent}>
                                    <h3 className={styles.emergencyTitle}>Emergency Support</h3>
                                    <p className={styles.emergencyText}>
                                        For urgent issues that require immediate attention, please call our emergency hotline or visit your nearest government office directly.
                                    </p>
                                    <button className={styles.emergencyButton}>Emergency Hotline: 999</button>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>💡</div>
                                <h2 className={styles.sectionTitle}>Quick Tips</h2>
                            </div>
                            <div className={styles.tipsGrid}>
                                <div className={styles.tipCard}>
                                    <div className={styles.tipIcon}>⚡</div>
                                    <h4 className={styles.tipTitle}>Be Specific</h4>
                                    <p className={styles.tipText}>Provide detailed descriptions and exact locations for faster resolution</p>
                                </div>
                                <div className={styles.tipCard}>
                                    <div className={styles.tipIcon}>📸</div>
                                    <h4 className={styles.tipTitle}>Add Evidence</h4>
                                    <p className={styles.tipText}>Include photos or documents to support your complaint</p>
                                </div>
                                <div className={styles.tipCard}>
                                    <div className={styles.tipIcon}>🔔</div>
                                    <h4 className={styles.tipTitle}>Stay Updated</h4>
                                    <p className={styles.tipText}>Enable notifications to get real-time updates on your complaints</p>
                                </div>
                                <div className={styles.tipCard}>
                                    <div className={styles.tipIcon}>💬</div>
                                    <h4 className={styles.tipTitle}>Provide Feedback</h4>
                                    <p className={styles.tipText}>Rate resolutions to help improve our services</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLeft}>
                        <span className={styles.footerLogo}>CivicEcho</span>
                        <span className={styles.footerTagline}>Building Better Communities Together</span>
                    </div>
                    <div className={styles.footerRight}>
                        <span className={styles.footerText}>© Team SM 2025 | All rights not yet reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HelpContact;