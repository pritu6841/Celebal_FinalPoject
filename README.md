# Kanban Board React App

A modern, responsive Kanban board application built with React. Organize your tasks and projects visually with boards, lists, and cards. Includes user authentication, theming, and drag-and-drop functionality.

## Features

- User registration and login
- Create, update, and delete boards
- Add lists and cards to boards
- Drag and drop cards between lists
- Attach files to cards (local only)
- Light and dark theme toggle
- Responsive design for desktop and mobile
- Data persistence using localStorage

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (v6 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name/Client
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage
- Register a new user or log in with existing credentials.
- Create a new board and add lists (e.g., To Do, In Progress, Done).
- Add cards to lists, assign due dates, assignees, and attachments.
- Drag and drop cards between lists to update their status.
- Switch between light and dark themes using the toggle button.

## Project Structure
```
Client/
  ├── public/
  ├── src/
  │   ├── components/
  │   ├── assets/
  │   ├── App.jsx
  │   ├── App.css
  │   └── ...
  ├── package.json
  └── README.md
```

## Technologies Used
- React
- Material-UI (MUI)
- Vite
- localStorage (for persistence)

## Limitations
- Attachments are not persisted after a page refresh (due to browser storage limitations).
- No backend/API integration (all data is local to your browser).

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License
[MIT](LICENSE)
