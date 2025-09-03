import { Link } from 'react-router-dom';
import styles from '../styles/about.module.css';

const About = ({ user, handleLogout }) => {
    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navWrapper}>
                    <div className={styles.logo}>
                        <span className={styles.logoText}>CivicEcho</span>
                    </div>
                    <ul className={styles.navList}>
                        {[
                            { to: user?.role === 'Citizen' ? "/citizens-dashboard" : "/government-dashboard", text: "Dashboard", icon: "🏠" },
                            { to: "/complaint", text: "New Complaint", icon: "📝", hide: user?.role === 'Government Official' },
                            { to: "/feedback", text: "Feedback", icon: "💬", hide: user?.role === 'Government Official' },
                            { to: "/solution", text: "Resolve Complaints", icon: "📝", hide: user?.role === 'Citizen' },
                            { to: "/about", text: "About", icon: "ℹ️", active: true },
                            { to: "/help", text: "Help & Contact", icon: "🆘" },
                            { to: "#", text: "Logout", icon: "🚪", onClick: handleLogout }
                        ].filter(item => !item.hide).map((item, index) => (
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
                        <h1 className={styles.title}>About CivicEcho</h1>
                        <p className={styles.subtitle}>
                            Empowering Citizens to Shape a Better Tomorrow
                        </p>
                        <div className={styles.heroDecoration}></div>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.sections}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>🎯</div>
                                <h2 className={styles.sectionTitle}>Our Mission</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <p className={styles.sectionText}>
                                    CivicEcho is a revolutionary platform designed to bridge the gap between citizens and government officials, fostering a more transparent, accountable, and responsive governance system. In an era where public voices often go unheard, CivicEcho amplifies the concerns of everyday people, ensuring that complaints and feedback reach the right ears and lead to tangible change.
                                </p>
                                <p className={styles.sectionText}>
                                    At its core, CivicEcho empowers citizens to raise their voices on critical issues affecting their communities—from crumbling infrastructure and waste management woes to traffic congestion and environmental concerns. By providing a seamless, user-friendly interface for submitting complaints, tracking their status, and offering feedback on resolutions, we ensure that every voice matters and every concern is addressed with the urgency it deserves.
                                </p>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>⚡</div>
                                <h2 className={styles.sectionTitle}>How It Works</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <div className={styles.processSteps}>
                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>1</div>
                                        <div className={styles.stepContent}>
                                            <h3>Register & Login</h3>
                                            <p>Citizens can easily register using their National ID (NID) and log in securely</p>
                                        </div>
                                    </div>
                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>2</div>
                                        <div className={styles.stepContent}>
                                            <h3>Submit Complaints</h3>
                                            <p>Submit detailed complaints with categories, locations, and optional attachments</p>
                                        </div>
                                    </div>
                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>3</div>
                                        <div className={styles.stepContent}>
                                            <h3>Smart Routing</h3>
                                            <p>Our intelligent system routes complaints to appropriate government officials</p>
                                        </div>
                                    </div>
                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>4</div>
                                        <div className={styles.stepContent}>
                                            <h3>Track & Feedback</h3>
                                            <p>Real-time tracking, updates, and feedback mechanisms ensure transparency</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionIcon}>👥</div>
                                <h2 className={styles.sectionTitle}>Our Team</h2>
                            </div>
                            <div className={styles.sectionContent}>
                                <div className={styles.teamContainer}>
                                    <div className={styles.teamMember}>
                                        <div className={styles.memberAvatar}>MM</div>
                                        <div className={styles.memberDetails}>
                                            <h3 className={styles.memberName}>Muhammad Bin Mamun</h3>
                                            <div className={styles.memberInfo}>
                                                <a href="https://github.com/MuhammadZT" target="_blank" rel="noopener noreferrer" className={styles.memberInfoItem}>
                                                    GitHub: MuhammadZT
                                                </a>
                                                <span className={styles.memberInfoItem}>ID: 2222953042</span>
                                                <span className={styles.memberInfoItem}>muhammad.mamun01@northsouth.edu</span>
                                                <span className={styles.memberInfoItem}>ECE, North South University</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.teamMember}>
                                        <div className={styles.memberAvatar}>SA</div>
                                        <div className={styles.memberDetails}>
                                            <h3 className={styles.memberName}>Saima Akther</h3>
                                            <div className={styles.memberInfo}>
                                                <a href="https://github.com/Saimaaaaa387" target="_blank" rel="noopener noreferrer" className={styles.memberInfoItem}>
                                                    GitHub: Saimaaaaa387
                                                </a>
                                                <span className={styles.memberInfoItem}>ID: 2132476642</span>
                                                <span className={styles.memberInfoItem}>akther.saima@northsouth.edu</span>
                                                <span className={styles.memberInfoItem}>ECE, North South University</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.teamDescription}>
                                    <p className={styles.sectionText}>
                                        As students of the ECE Department at North South University, we are passionate about using technology to solve real-world problems and create positive social impact through innovative digital solutions.
                                    </p>
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

export default About;