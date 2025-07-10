import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import { useTheme } from '@mui/material/styles';

const KanbanList = ({ 
  list, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard, 
  onDeleteList, 
  currentUser 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  const theme = useTheme();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteList = () => {
    onDeleteList(list.id);
    handleMenuClose();
  };

  return (
    <Paper
      ref={setNodeRef}
      className="list-container"
      sx={{
        width: 300,
        minHeight: 400,
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
          {list.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            {list.cards.length}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onDeleteList(list.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete List
        </MenuItem>
      </Menu>

      <SortableContext items={list.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {list.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              listId={list.id}
              onUpdateCard={(cardId, updatedCard) => onUpdateCard(list.id, cardId, updatedCard)}
              onDeleteCard={(cardId) => onDeleteCard(list.id, cardId)}
              currentUser={currentUser}
            />
          ))}
        </Box>
      </SortableContext>

      <Button
        startIcon={<AddIcon />}
        onClick={() => onAddCard(list.id)}
        sx={{ 
          mt: 'auto',
          width: '100%',
          justifyContent: 'center',
          color: 'primary.main',
          backgroundColor: 'background.default',
          border: '2px dashed #90caf9',
          borderRadius: 2,
          minHeight: 48,
          fontWeight: 600,
          boxShadow: '0 1px 4px rgba(47,128,237,0.06)',
          transition: 'background 0.2s, border 0.2s',
          '&:hover': {
            bgcolor: 'action.hover',
            border: '2px solid #1976d2',
          },
          zIndex: 2,
        }}
      >
        Add Card
      </Button>
    </Paper>
  );
};

export default KanbanList; 