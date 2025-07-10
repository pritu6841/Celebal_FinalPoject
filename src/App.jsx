import React, { useState, useEffect, useRef } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { v4 as uuidv4 } from 'uuid';
import KanbanBoard from './components/KanbanBoard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import DeleteIcon from '@mui/icons-material/Delete';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddIcon from '@mui/icons-material/Add';
import ProfilePage from './components/ProfilePage';
import EditIcon from '@mui/icons-material/Edit';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Add this useEffect to update body class based on theme
  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${themeMode}-theme`);
  }, [themeMode]);

  // Derive currentBoard from boards array
  // Load data from localStorage on app start
  useEffect(() => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let savedBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const savedCurrentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const savedSelectedBoardId = localStorage.getItem('selectedBoardId');
      
      if (savedCurrentUser) {
        setCurrentUser(savedCurrentUser);
      }
      
      // MIGRATION: Remove boards without createdBy, and ensure all boards have createdBy
      savedBoards = savedBoards.filter(board => board.createdBy);
      // Optionally, you could set createdBy to a default value if missing, but safer to remove
      localStorage.setItem('boards', JSON.stringify(savedBoards));
      
      if (savedBoards && Array.isArray(savedBoards) && savedBoards.length > 0) {
        // Filter boards by current user if user is logged in
        const userBoards = savedCurrentUser 
          ? savedBoards.filter(board => board.createdBy === savedCurrentUser.id)
          : savedBoards; // Show all boards if no user is logged in
        setBoards(userBoards);
        
        // Restore selected board if it exists and belongs to current user
        if (savedSelectedBoardId && userBoards.some(board => board.id === savedSelectedBoardId)) {
          setSelectedBoardId(savedSelectedBoardId);
        } else if (userBoards.length > 0) {
          // If no selected board but boards exist, select the first one
          setSelectedBoardId(userBoards[0].id);
        } else {
          setSelectedBoardId(null);
        }
      } else {
        setBoards([]);
        setSelectedBoardId(null);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  // Remove this useEffect:
  // useEffect(() => {
  //   try {
  //     console.log('Saving boards to localStorage:', boards.length, 'boards', boards);
  //     localStorage.setItem('boards', JSON.stringify(boards));
  //     console.log('Successfully saved boards to localStorage');
  //   } catch (error) {
  //     console.error('Error saving boards to localStorage:', error);
  //   }
  // }, [boards]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Save selectedBoardId to localStorage
  useEffect(() => {
    if (selectedBoardId) {
      localStorage.setItem('selectedBoardId', selectedBoardId);
    } else {
      localStorage.removeItem('selectedBoardId');
    }
  }, [selectedBoardId]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Refilter boards when current user changes
  useEffect(() => {
    if (currentUser) {
      const savedBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const userBoards = savedBoards.filter(board => board.createdBy === currentUser.id);
      setBoards(userBoards);
      
      // Update selected board if current selection doesn't belong to user
      if (selectedBoardId && !userBoards.some(board => board.id === selectedBoardId)) {
        setSelectedBoardId(userBoards.length > 0 ? userBoards[0].id : null);
      }
    } else {
      // Clear boards when user logs out
      setBoards([]);
      setSelectedBoardId(null);
    }
  }, [currentUser]);

  const canvasRef = useRef(null);
  useEffect(() => {
    if (currentUser) return; // Only run animation if not logged in
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    // 3D Cube config
    const cubeCount = 32;
    const colors = themeMode === 'dark'
      ? ['#fff', '#2F80ED', '#56CCF2']
      : ['#2F80ED', '#56CCF2', '#F4F6F8', '#B2F0E6', '#A0C4FF'];
    const cubes = Array.from({ length: cubeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 600 + 200,
      size: Math.random() * 24 + 16,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 1.2 + 0.4,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 0.01 + 0.005,
    }));
    function drawCube(cx, cy, size, angle, color, z) {
      ctx.save();
      // Perspective
      const perspective = 400 / (z + 1);
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(perspective, perspective);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.rect(-size / 2, -size / 2, size, size);
      ctx.fill();
      ctx.restore();
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const cube of cubes) {
        drawCube(cube.x, cube.y, cube.size, cube.angle, cube.color, cube.z);
      }
    }
    function animate() {
      for (const cube of cubes) {
        cube.z -= cube.speed;
        cube.angle += cube.rotSpeed;
        if (cube.z < 50) {
          cube.z = Math.random() * 600 + 400;
          cube.x = Math.random() * width;
          cube.y = Math.random() * height;
          cube.size = Math.random() * 24 + 16;
          cube.color = colors[Math.floor(Math.random() * colors.length)];
          cube.speed = Math.random() * 1.2 + 0.4;
          cube.angle = Math.random() * Math.PI * 2;
          cube.rotSpeed = Math.random() * 0.01 + 0.005;
        }
      }
      draw();
      animationId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [themeMode, currentUser]);

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#2F80ED',
        contrastText: '#fff',
      },
      secondary: {
        main: '#56CCF2',
        contrastText: '#fff',
      },
      background: themeMode === 'light'
        ? { default: '#F4F6F8', paper: '#FFFFFF' }
        : { default: '#181A1B', paper: '#23272A' },
      text: themeMode === 'light'
        ? { primary: '#333333', secondary: '#2F80ED' }
        : { primary: '#F4F6F8', secondary: '#56CCF2' },
    },
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowLogin(false);
    const savedBoards = JSON.parse(localStorage.getItem('boards') || '[]');
    // Filter boards to only show boards created by the current user
    const userBoards = savedBoards.filter(board => board.createdBy === user.id);
    setBoards(userBoards);
    // Restore selected board ID only if it belongs to the current user
    const savedSelectedBoardId = localStorage.getItem('selectedBoardId');
    if (savedSelectedBoardId && userBoards.some(board => board.id === savedSelectedBoardId)) {
      setSelectedBoardId(savedSelectedBoardId);
    } else if (userBoards.length > 0) {
      setSelectedBoardId(userBoards[0].id);
    } else {
      setSelectedBoardId(null);
    }
    showSnackbar('Successfully logged in!', 'success');
  };

  const handleRegister = (user) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    setCurrentUser(user);
    // Clear boards for new user - they should start with empty boards
    setBoards([]);
    setSelectedBoardId(null);
    setShowRegister(false);
    showSnackbar('Successfully registered and logged in!', 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setBoards([]);
    setSelectedBoardId(null);
    showSnackbar('Successfully logged out!', 'info');
  };

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    
    const newBoard = {
      id: uuidv4(),
      name: newBoardName,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      lists: [
        {
          id: uuidv4(),
          name: 'To Do',
          cards: []
        },
        {
          id: uuidv4(),
          name: 'In Progress',
          cards: []
        },
        {
          id: uuidv4(),
          name: 'Done',
          cards: []
        }
      ]
    };
    
    // Get all boards from localStorage
    const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
    const updatedAllBoards = [...allBoards, newBoard];
    localStorage.setItem('boards', JSON.stringify(updatedAllBoards));

    // Update only current user's boards in state
    const userBoards = updatedAllBoards.filter(board => board.createdBy === currentUser.id);
    setBoards(userBoards);
    setSelectedBoardId(newBoard.id); // Auto-select the new board
    setNewBoardName('');
    setShowNewBoard(false);
    showSnackbar('Board created successfully!', 'success');
  };

  const handleUpdateBoard = (updatedBoard) => {
    setBoards(prevBoards => {
      // Find the latest version of the board from state
      const latestBoard = prevBoards.find(board => board.id === updatedBoard.id);
      // Merge the update into the latest board
      const mergedBoard = latestBoard ? { ...latestBoard, ...updatedBoard, lists: updatedBoard.lists } : updatedBoard;
      // Update the board in the full array
      const updatedAllBoards = prevBoards.map(board =>
        board.id === mergedBoard.id ? mergedBoard : board
      );
      // Save to localStorage (update all boards, not just current user)
      const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const allBoardsUpdated = allBoards.map(board =>
        board.id === mergedBoard.id ? mergedBoard : board
      );
      localStorage.setItem('boards', JSON.stringify(allBoardsUpdated));
      // Filter for current user
      const userBoards = updatedAllBoards.filter(board => board.createdBy === currentUser.id);
      // Update selected board
      if (userBoards.some(board => board.id === mergedBoard.id)) {
        setSelectedBoardId(mergedBoard.id);
      } else if (userBoards.length > 0) {
        setSelectedBoardId(userBoards[0].id);
      } else {
        setSelectedBoardId(null);
      }
      return userBoards;
    });
  };

  // Add a new list to the current board
  const handleAddList = (boardId, listName) => {
    setBoards(prevBoards => {
      const updatedBoards = prevBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: [
            ...board.lists,
            { id: uuidv4(), name: listName, cards: [] }
          ]
        };
      });
      // Update localStorage
      const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const allBoardsUpdated = allBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: [
            ...board.lists,
            { id: uuidv4(), name: listName, cards: [] }
          ]
        };
      });
      localStorage.setItem('boards', JSON.stringify(allBoardsUpdated));
      return updatedBoards;
    });
  };

  // Add a new card to a list in the current board
  const handleAddCard = (boardId, listId, cardData) => {
    setBoards(prevBoards => {
      const updatedBoards = prevBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: [
                ...list.cards,
                {
                  id: uuidv4(),
                  ...cardData,
                  createdBy: currentUser.id,
                  createdAt: new Date().toISOString(),
                  attachments: cardData.attachments || []
                }
              ]
            };
          })
        };
      });
      // Update localStorage
      const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const allBoardsUpdated = allBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: [
                ...list.cards,
                {
                  id: uuidv4(),
                  ...cardData,
                  createdBy: currentUser.id,
                  createdAt: new Date().toISOString(),
                  attachments: cardData.attachments || []
                }
              ]
            };
          })
        };
      });
      localStorage.setItem('boards', JSON.stringify(allBoardsUpdated));
      return updatedBoards;
    });
  };

  // Update a card in a list
  const handleUpdateCard = (boardId, listId, cardId, updatedCard) => {
    setBoards(prevBoards => {
      const updatedBoards = prevBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: list.cards.map(card =>
                card.id === cardId ? { ...card, ...updatedCard } : card
              )
            };
          })
        };
      });
      // Update localStorage
      const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const allBoardsUpdated = allBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: list.cards.map(card =>
                card.id === cardId ? { ...card, ...updatedCard } : card
              )
            };
          })
        };
      });
      localStorage.setItem('boards', JSON.stringify(allBoardsUpdated));
      return updatedBoards;
    });
  };

  // Delete a card from a list
  const handleDeleteCard = (boardId, listId, cardId) => {
    setBoards(prevBoards => {
      const updatedBoards = prevBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: list.cards.filter(card => card.id !== cardId)
            };
          })
        };
      });
      // Update localStorage
      const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const allBoardsUpdated = allBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.map(list => {
            if (list.id !== listId) return list;
            return {
              ...list,
              cards: list.cards.filter(card => card.id !== cardId)
            };
          })
        };
      });
      localStorage.setItem('boards', JSON.stringify(allBoardsUpdated));
      return updatedBoards;
    });
  };

  // Delete a list from a board
  const handleDeleteList = (boardId, listId) => {
    setBoards(prevBoards => {
      const updatedBoards = prevBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.filter(list => list.id !== listId)
        };
      });
      // Update localStorage
      const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
      const allBoardsUpdated = allBoards.map(board => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          lists: board.lists.filter(list => list.id !== listId)
        };
      });
      localStorage.setItem('boards', JSON.stringify(allBoardsUpdated));
      return updatedBoards;
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  // Handler to update user info
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    // Update user in localStorage users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
  };

  if (!currentUser) {
    // Background gradient for light mode
    const backgroundStyle = themeMode === 'light'
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          background: 'linear-gradient(135deg, #F4F6F8 0%, #A0C4FF 50%, #B2F0E6 100%)',
          transition: 'background 0.5s',
        }
      : {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          background: '#181A1B',
          transition: 'background 0.5s',
        };
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <div style={backgroundStyle} />
          <canvas
            ref={canvasRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 1,
              pointerEvents: 'none',
              transition: 'background 0.5s',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Container maxWidth="sm">
              <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 4, 
                borderRadius: 2, 
                boxShadow: 3,
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
              }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                  Kanban Board
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Task Management & Workflow Visualization
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => setShowLogin(true)}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => setShowRegister(true)}
                  >
                    Register
                  </Button>
                </Box>
              </Box>
            </Container>
          </Box>
          
          <LoginForm 
            open={showLogin} 
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
          
          <RegisterForm 
            open={showRegister} 
            onClose={() => setShowRegister(false)}
            onRegister={handleRegister}
          />
        </Box>
      </ThemeProvider>
    );
  }

  if (showProfile) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onClose={() => setShowProfile(false)}
          />
        </LocalizationProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2, background: 'none' }}>
            <Toolbar sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: '0 !important',
              paddingTop: '0 !important',
              paddingBottom: '0 !important',
              height: { xs: 48, sm: 56 },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, height: '100%', justifyContent: 'space-between' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    verticalAlign: 'middle',
                    color: theme.palette.text.primary, 
                    fontSize: isMobile ? '1.1rem' : '1.5rem',
                    fontWeight: 700,
                    pl: isMobile ? 1 : 0,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'font-size 0.2s',
                  }}
                >
                  Kanban Board
                </Typography>
                {/* Only show + New Board button on large screens */}
                {!isMobile && (
                  <Button 
                    color="inherit" 
                    onClick={() => setShowNewBoard(true)}
                    sx={{ fontWeight: 600, borderRadius: 2, px: 2, py: 1, fontSize: 16 }}
                    startIcon={<AddIcon />}
                  >
                    New Board
                  </Button>
                )}
              </Box>
              {/* Responsive right-side controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', ml: isMobile ? 'auto' : 0 }}>
                {/* Theme toggler to the left of profile icon on mobile */}
                <IconButton
                  onClick={handleToggleTheme}
                  sx={{ ml: isMobile ? 0 : 2, mr: isMobile ? 1 : 2 }}
                  title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                {/* Profile icon with dropdown menu on mobile */}
                <IconButton
                  onClick={isMobile ? handleProfileMenuOpen : () => setShowProfile(true)}
                  sx={{ p: 0, width: 40, height: 40 }}
                  title="Edit Profile"
                >
                  <Avatar
                    src={currentUser.avatar || ''}
                    alt={currentUser.name || ''}
                    sx={{ width: 40, height: 40, bgcolor: '#2F80ED', fontWeight: 600 }}
                  >
                    {(!currentUser.avatar && currentUser.name) ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : ''}
                  </Avatar>
                  {!isMobile && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        border: '1.5px solid #e3e8ee',
                        boxShadow: 2,
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <EditIcon fontSize="small" sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Box>
                  )}
                </IconButton>
                {/* Profile dropdown menu for mobile */}
                {isMobile && (
                  <Menu
                    anchorEl={profileMenuAnchor}
                    open={Boolean(profileMenuAnchor)}
                    onClose={handleProfileMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={() => { setShowNewBoard(true); handleProfileMenuClose(); }}>+ New Board</MenuItem>
                    <MenuItem onClick={() => { setShowProfile(true); handleProfileMenuClose(); }}>Edit Profile</MenuItem>
                    <MenuItem onClick={() => { handleLogout(); handleProfileMenuClose(); }}>Logout</MenuItem>
                  </Menu>
                )}
                {/* Inline logout button for desktop */}
                {!isMobile && (
                  <>
                    <Typography variant="body2" sx={{ mr: 2, ml: 2 }}>
                      Welcome, {currentUser.name}!
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                      Logout
                    </Button>
                  </>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ flexGrow: 1, p: 3 }}>
            {boards.length === 0 ? (
              <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <Paper elevation={4} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 260,
                    minWidth: 400,
                    maxWidth: 500,
                    mx: 'auto',
                    p: 5,
                    borderRadius: 4,
                    boxShadow: 6,
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 12,
                      background: theme.palette.action.hover,
                    },
                  }}>
                    <AddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                      Create Your First Board
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Start organizing your tasks and projects visually.
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewBoard(true)}
                      sx={{ fontSize: 18, px: 4, py: 1.5, borderRadius: 3 }}
                    >
                      Create Board
                    </Button>
                  </Paper>
                </Box>
              </Container>
            ) : (
              <Container maxWidth="xl">
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Your Boards
                  </Typography>
                  <TextField
                    label="Search Boards"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    sx={{ mb: 2, width: 300 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {boards
                      .filter(board => board.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((board) => (
                        <Box key={board.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }} className="board-card">
                          <Button
                            variant={selectedBoardId === board.id ? "contained" : "outlined"}
                            onClick={() => setSelectedBoardId(board.id)}
                            sx={{ mr: 1 }}
                          >
                            {board.name}
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the board '${board.name}'?`)) {
                                const updatedBoards = boards.filter(b => b.id !== board.id);
                                setBoards(updatedBoards);
                                // Update localStorage to remove the deleted board
                                const allBoards = JSON.parse(localStorage.getItem('boards') || '[]');
                                const updatedAllBoards = allBoards.filter(b => b.id !== board.id);
                                localStorage.setItem('boards', JSON.stringify(updatedAllBoards));
                                // If the deleted board was selected, select another or clear
                                if (selectedBoardId === board.id) {
                                  setSelectedBoardId(updatedBoards[0]?.id || null);
                                }
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                  </Box>
                </Box>
                
                {(() => {
                  const currentBoard = boards.find(board => board.id === selectedBoardId) || null;
                  return currentBoard && (
                    <KanbanBoard 
                      board={currentBoard}
                      onUpdateBoard={handleUpdateBoard}
                      onAddList={handleAddList}
                      onAddCard={handleAddCard}
                      onUpdateCard={handleUpdateCard}
                      onDeleteCard={handleDeleteCard}
                      onDeleteList={handleDeleteList}
                      currentUser={currentUser}
                      className="kanban-board-fullpage"
                    />
                  );
                })()}
              </Container>
            )}
          </Box>
        </Box>

        {/* New Board Dialog */}
        <Dialog open={showNewBoard} onClose={() => setShowNewBoard(false)} PaperProps={{
          sx: {
            minWidth: 400,
            borderRadius: 4,
            boxShadow: 12,
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }
        }}>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 28, pb: 0 }}>
            Create New Board
          </DialogTitle>
          <DialogContent sx={{ width: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Board Name"
              fullWidth
              variant="outlined"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
              sx={{ mb: 2, mt: 2, input: { fontSize: 18, fontWeight: 500 } }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={() => setShowNewBoard(false)} sx={{ fontWeight: 600, px: 3 }}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard} variant="contained" sx={{ fontWeight: 600, px: 4, py: 1, fontSize: 16 }}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
