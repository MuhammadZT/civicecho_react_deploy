import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/register.module.css';

const Register = ({ updateUser }) => {
  const [nid, setNid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const navigate = useNavigate();

  const locations = {
    Dhaka: {
      districts: [
        { name: 'Dhaka', upazilas: ['Dhanmondi', 'Mirpur', 'Gulshan', 'Khilgaon', 'Badda', 'Mohakhali', 'Tejgaon', 'Puranapara'] },
        { name: 'Gazipur', upazilas: ['Tongi', 'Kaliakair', 'Sreepur', 'Kapasia'] },
        { name: 'Narayanganj', upazilas: ['Narayanganj Sadar', 'Rupganj', 'Sonargaon'] },
        { name: 'Mymensingh', upazilas: ['Mymensingh Sadar', 'Trishal', 'Ishwarganj', 'Haluaghat', 'Gouripur'] },
        { name: 'Tangail', upazilas: ['Tangail Sadar', 'Gopalpur', 'Kalihati', 'Nagarpur'] },
        { name: 'Kishoreganj', upazilas: ['Kishoreganj Sadar', 'Mithamain', 'Bajitpur', 'Karimganj'] },
        { name: 'Moulvibazar', upazilas: ['Moulvibazar Sadar', 'Kulaura', 'Barlekha', 'Juri'] },
        { name: 'Faridpur', upazilas: ['Faridpur Sadar', 'Nagarkanda', 'Boalmari', 'Madhukhali'] },
        { name: 'Munshiganj', upazilas: ['Munshiganj Sadar', 'Sreenagar'] },
        { name: 'Madaripur', upazilas: ['Madaripur Sadar', 'Shibchar'] },
        { name: 'Shariatpur', upazilas: ['Shariatpur Sadar', 'Bhedarganj'] },
        { name: 'Rajbari', upazilas: ['Rajbari Sadar', 'Pangsha', 'Goalanda'] },
        { name: 'Manikganj', upazilas: ['Manikganj Sadar', 'Shibalaya', 'Daulatpur'] },
        { name: 'Narsingdi', upazilas: ['Narsingdi Sadar', 'Raipura', 'Belabo', 'Monohardi'] }
      ]
    }
  };

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
    setSelectedUpazila('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = {
      nid,
      name,
      email,
      contact,
      password,
      role: 'Citizen',
      location: { division: 'Dhaka', district: selectedDistrict, upazila: selectedUpazila }
    };

    try {
      const response = await fetch('http://localhost:8000/backend/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        const userData = { nid, role: 'Citizen' };
        updateUser(userData);
        navigate('/login');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.decorativeCircle}></div>

      <div className={styles.formContainer}>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>
          Join CivicEcho today and start managing your civic grievances efficiently.
        </p>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="nid" className={styles.label}>NID Number</label>
            <input
              type="text"
              id="nid"
              name="nid"
              placeholder="NID"
              required
              value={nid}
              onChange={(e) => setNid(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact" className={styles.label}>Contact Number</label>
            <input
              type="text"
              id="contact"
              name="contact"
              placeholder="Contact Number"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="district" className={styles.label}>District</label>
            <select
              id="district"
              name="district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className={styles.select}
            >
              <option value="">Select District</option>
              {locations.Dhaka.districts.map((district) => (
                <option key={district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDistrict && (
            <div className={styles.formGroup}>
              <label htmlFor="upazila" className={styles.label}>Upazila</label>
              <select
                id="upazila"
                name="upazila"
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Upazila</option>
                {locations.Dhaka.districts
                  .find((district) => district.name === selectedDistrict)
                  ?.upazilas.map((upazila) => (
                    <option key={upazila} value={upazila}>
                      {upazila}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div className={styles.footer}>
          Already have an account?{' '}
          <button
            onClick={handleLoginRedirect}
            className={styles.loginButton}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;