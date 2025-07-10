import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar, IconButton, InputAdornment, Paper } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function ProfilePage({ currentUser, onUpdateUser, onClose }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
        setAvatarFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Only update password if changed
    const updatedUser = {
      ...currentUser,
      id: currentUser.id, // Ensure ID is always present and unchanged
      name,
      email,
      avatar,
      ...(password ? { password } : {}),
    };
    onUpdateUser(updatedUser);
    setSaving(false);
    if (onClose) onClose();
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Profile Management
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar src={avatar} sx={{ width: 80, height: 80, mb: 1 }} />
          <label htmlFor="avatar-upload">
            <input
              accept="image/*"
              id="avatar-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>
        <form onSubmit={handleSave}>
          <TextField
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            type="email"
          />
          <TextField
            label="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            type="password"
            placeholder="Leave blank to keep current password"
            InputProps={{
              endAdornment: <InputAdornment position="end">*</InputAdornment>,
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={onClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={saving}>
              Save
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default ProfilePage; 