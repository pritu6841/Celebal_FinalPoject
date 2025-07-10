import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const RegisterForm = ({ open, onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === formData.email);
    
    if (existingUser) {
      setError('User with this email already exists');
      return;
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      createdAt: new Date().toISOString()
    };

    onRegister(newUser);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Register
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterForm; 