# 🚀 Sharp - Insurance Activity Management System

A modern, responsive web application built with React and Vite for managing insurance activities, endorsements, and documentation.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-Private-red)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [Development](#-development)

## ✨ Features

### 🎯 Activity Notes Management
- **Dynamic Forms**: Context-aware forms for different insurance activities
- **Multiple Activity Types**: Support for Auto, Property, and Commercial insurance activities
- **Custom Notes**: Structured notes with sections and checklists
- **Copy to Clipboard**: Quick copy functionality for form data
- **Dual Note System**: Primary and secondary note cards for comprehensive documentation

### 📄 Endorsements Reference
- **Auto Endorsements**: Complete reference for automotive insurance endorsements
- **Property Endorsements**: Comprehensive property insurance endorsement guide
- **Interactive UI**: Hover and click interactions for detailed descriptions
- **Search & Filter**: Easy navigation through endorsement types

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Navigation**: Sidebar with smooth scrolling and active section highlighting
- **Modern UI**: Clean, professional interface with intuitive interactions
- **Accessibility**: Built with ARIA labels and keyboard navigation support

## 🛠 Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **Language**: JavaScript (ES6+)
- **Styling**: CSS3 with modern features
- **Deployment**: Vercel-ready configuration

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sharp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📁 Project Structure

```
Sharp/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ActivityForm.jsx
│   │   ├── ActivitySection.jsx
│   │   ├── CustomSelect.jsx
│   │   ├── DatePicker.jsx
│   │   ├── Endorsements.jsx
│   │   └── Sidebar.jsx
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── vercel.json          # Vercel deployment config
└── package.json         # Project dependencies
```

## 💻 Usage

### Activity Notes

1. **Select Activity Type**: Choose from the dropdown in the activity form
2. **Fill Form Fields**: Complete the context-specific form fields
3. **Review Notes**: Check the notes section for required documentation
4. **Copy Form Data**: Use the "Copy" button to copy formatted form data
5. **Add Second Note**: Toggle the "Add Second Note" button for additional documentation

### Endorsements

1. **Switch Mode**: Toggle between "Auto" and "Property" endorsements
2. **Browse List**: Scroll through available endorsements
3. **View Details**: Hover or click on an endorsement to see detailed description
4. **Lock Selection**: Click an endorsement to lock it in place

### Navigation

- Use the sidebar to navigate between sections:
  - **Activity Notes**: Main activity management interface
  - **Quotes**: Custom quotes section
  - **Docs**: Documentation and endorsements

## 🚢 Deployment

This project is configured for deployment on **Vercel**.

### Deploy to Vercel

#### Option 1: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

#### Option 2: Via GitHub Integration
1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com)
3. Vercel will auto-detect the configuration and deploy

#### Option 3: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically:
   - Detect Vite configuration
   - Run `npm install`
   - Build with `npm run build`
   - Deploy the `dist` folder

### Build Configuration

The project includes:
- ✅ `vercel.json` with proper routing for SPA
- ✅ Optimized Vite build configuration
- ✅ Production-ready build output

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Style

- ESLint is configured for code quality
- Follow React best practices
- Use functional components with hooks
- Maintain consistent component structure

## 📝 Notes

- The application uses client-side routing
- All form data is stored in component state
- No backend required for basic functionality
- Customizable activity types and form schemas

## 🤝 Contributing

This is a private project. For contributions or questions, please contact the project maintainer.

## 📄 License

Private - All rights reserved

---

**Built with ❤️ using React and Vite**
