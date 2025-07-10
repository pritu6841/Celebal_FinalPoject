import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const KanbanCard = ({ card, listId, onUpdateCard, onDeleteCard, currentUser }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: card.title,
    description: card.description,
    assignee: card.assignee,
    dueDate: card.dueDate
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const theme = useTheme();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    disabled: false
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMenuOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Menu clicked!', event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditData({
      title: card.title,
      description: card.description,
      assignee: card.assignee,
      dueDate: card.dueDate
    });
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteCard(card.id);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    onUpdateCard(card.id, editData);
    setShowEditDialog(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAttachFile = () => {
    if (selectedFile) {
      const newAttachment = {
        id: Date.now(),
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadedAt: new Date().toISOString()
      };

      const updatedCard = {
        ...card,
        attachments: [...(card.attachments || []), newAttachment]
      };

      onUpdateCard(card.id, updatedCard);
      setSelectedFile(null);
      setShowAttachmentDialog(false);
    }
  };

  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    
    const today = startOfDay(new Date());
    const dueDate = startOfDay(new Date(card.dueDate));
    
    if (isBefore(dueDate, today)) {
      return { status: 'overdue', color: 'error' };
    } else if (isAfter(dueDate, today)) {
      return { status: 'upcoming', color: 'warning' };
    } else {
      return { status: 'due-today', color: 'info' };
    }
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <motion.div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: isDragging ? 0.5 : 1, y: 0, scale: isDragging ? 0.97 : 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(86,204,242,0.18)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.7 }}
        >
          <Paper
            sx={{
              p: 2,
              cursor: 'grab',
              bgcolor: theme.palette.mode === 'dark' ? '#31363b' : '#e3e8ee',
              color: theme.palette.text.primary,
              boxShadow: '0 2px 8px rgba(47,128,237,0.10)',
              '&:active': {
                cursor: 'grabbing'
              },
              '&:hover': {
                boxShadow: 3
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                {card.title}
              </Typography>
            </Box>

            {card.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {card.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {card.assignee && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {card.assignee}
                  </Typography>
                </Box>
              )}

              {card.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(card.dueDate), 'MMM dd, yyyy')}
                  </Typography>
                  {dueDateStatus && (
                    <Chip
                      label={dueDateStatus.status === 'overdue' ? 'Overdue' : 
                             dueDateStatus.status === 'due-today' ? 'Due Today' : 'Upcoming'}
                      size="small"
                      color={dueDateStatus.color}
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              {/* Attachments */}
              {card.attachments && card.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Attachments:</Typography>
                  {card.attachments.map((file) => {
                    const isBlob = file.file && (file.file instanceof Blob || (typeof File !== 'undefined' && file.file instanceof File));
                    return (
                      <Button
                        key={file.id}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 0.5, mb: 0.5, mr: 1, textTransform: 'none' }}
                        href={isBlob ? URL.createObjectURL(file.file) : undefined}
                        target={isBlob ? "_blank" : undefined}
                        rel={isBlob ? "noopener noreferrer" : undefined}
                        disabled={!isBlob}
                      >
                        {file.name}{!isBlob && ' (unavailable)'}
                      </Button>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>
        
        {/* Menu button outside the draggable area */}
        <Box
          onClick={handleMenuOpen}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: 'background.paper',
            boxShadow: 1,
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            },
            zIndex: 1000
          }}
        >
          <MoreVertIcon fontSize="small" />
        </Box>
        

      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ zIndex: 9999 }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Card Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Card</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Card Title"
            fullWidth
            variant="outlined"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Assignee"
            fullWidth
            variant="outlined"
            value={editData.assignee}
            onChange={(e) => setEditData({ ...editData, assignee: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={editData.dueDate}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Dialog */}
      <Dialog open={showAttachmentDialog} onClose={() => setShowAttachmentDialog(false)}>
        <DialogTitle>Attach File</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ marginBottom: '16px' }}
          />
          {selectedFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAttachmentDialog(false)}>Cancel</Button>
          <Button onClick={handleAttachFile} variant="contained" disabled={!selectedFile}>
            Attach
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KanbanCard; 