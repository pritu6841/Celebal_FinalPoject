import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanList from './KanbanList';
import KanbanCard from './KanbanCard';
import { v4 as uuidv4 } from 'uuid';

const KanbanBoard = ({ board, onUpdateBoard, currentUser, className, onAddList, onAddCard, onUpdateCard, onDeleteCard, onDeleteList }) => {
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewCard, setShowNewCard] = useState({ show: false, listId: null });
  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    attachments: []
  });
  const [newCardFile, setNewCardFile] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    // Find the source list (where the card is currently)
    const sourceList = board.lists.find(list => 
      list.cards.some(card => card.id === active.id)
    );

    if (!sourceList) return;

    // Find the target list (where the card is being dropped)
    const targetList = board.lists.find(list => 
      list.cards.some(card => card.id === over.id) || list.id === over.id
    );

    if (!targetList) return;

    const cardToMove = sourceList.cards.find(card => card.id === active.id);
    if (!cardToMove) return;

    // If moving within the same list
    if (sourceList.id === targetList.id) {
      const oldIndex = sourceList.cards.findIndex(card => card.id === active.id);
      const newIndex = sourceList.cards.findIndex(card => card.id === over.id);

      const updatedList = {
        ...sourceList,
        cards: arrayMove(sourceList.cards, oldIndex, newIndex)
      };

      const updatedBoard = {
        ...board,
        lists: board.lists.map(list => 
          list.id === sourceList.id ? updatedList : list
        )
      };

      onUpdateBoard(updatedBoard);
    } else {
      // Moving between different lists
      const updatedSourceList = {
        ...sourceList,
        cards: sourceList.cards.filter(card => card.id !== active.id)
      };

      const updatedTargetList = {
        ...targetList,
        cards: [...targetList.cards, cardToMove]
      };

      const updatedBoard = {
        ...board,
        lists: board.lists.map(list => {
          if (list.id === sourceList.id) return updatedSourceList;
          if (list.id === targetList.id) return updatedTargetList;
          return list;
        })
      };

      onUpdateBoard(updatedBoard);
    }
  };



  // Use handler props for adding list and card
  const handleCreateList = () => {
    if (!newListName.trim()) return;
    onAddList(board.id, newListName);
    setNewListName('');
    setShowNewList(false);
  };

  const handleCreateCard = () => {
    if (!newCardData.title.trim()) return;
    let attachments = [];
    if (newCardFile) {
      attachments.push({
        id: Date.now(),
        name: newCardFile.name,
        size: newCardFile.size,
        type: newCardFile.type,
        file: newCardFile,
        uploadedAt: new Date().toISOString()
      });
    }
    onAddCard(board.id, showNewCard.listId, { ...newCardData, attachments });
    setNewCardData({ title: '', description: '', assignee: '', dueDate: '', attachments: [] });
    setNewCardFile(null);
    setShowNewCard({ show: false, listId: null });
  };

  return (
    <Box className={className}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {board.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowNewList(true)}
          sx={{
            ml: 'auto',
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(47,128,237,0.10)',
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: '#fff',
            transition: 'box-shadow 0.2s, background 0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.24)',
            },
          }}
        >
          Add List
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {board.lists.map((list) => (
            <KanbanList
              key={list.id}
              list={list}
              onAddCard={(listId) => setShowNewCard({ show: true, listId })}
              onUpdateCard={(listId, cardId, updatedCard) => onUpdateCard(board.id, listId, cardId, updatedCard)}
              onDeleteCard={(listId, cardId) => onDeleteCard(board.id, listId, cardId)}
              onDeleteList={(listId) => onDeleteList(board.id, listId)}
              currentUser={currentUser}
            />
          ))}
        </Box>
      </DndContext>

      {/* New List Dialog */}
      <Dialog open={showNewList} onClose={() => setShowNewList(false)}>
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewList(false)}>Cancel</Button>
          <Button onClick={handleCreateList} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Card Dialog */}
      <Dialog open={showNewCard.show} onClose={() => setShowNewCard({ show: false, listId: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Card</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Card Title"
            fullWidth
            variant="outlined"
            value={newCardData.title}
            onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newCardData.description}
            onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Assignee"
            fullWidth
            variant="outlined"
            value={newCardData.assignee}
            onChange={(e) => setNewCardData({ ...newCardData, assignee: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={newCardData.dueDate}
            onChange={(e) => setNewCardData({ ...newCardData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              onChange={e => setNewCardFile(e.target.files[0])}
              style={{ display: 'block', marginTop: 8 }}
            />
            {newCardFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {newCardFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCard({ show: false, listId: null })}>Cancel</Button>
          <Button onClick={handleCreateCard} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard; 