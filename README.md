# LinkCreator

A modern link-in-bio application built with React and Firebase that allows users to create personalized profile pages with their important links.

## Features

### User Management
- **Authentication**: Email/password registration and login
- **User Profiles**: Customizable profiles with username, description, and avatar
- **Social Networks**: Integration with major social platforms (YouTube, Facebook, X/Twitter, LinkedIn, GitHub, Instagram, Pinterest)

### Link Management
- **Create Links**: Add custom links with names and URLs
- **Drag & Drop Reordering**: Rearrange links with intuitive drag-and-drop interface
- **Edit/Delete**: Modify or remove existing links
- **Order Persistence**: Link order is saved and maintained across sessions

### Analytics & Tracking
- **Visit Tracking**: Monitor clicks on your links
- **Geographic Analytics**: See visitor locations by country
- **Device Analytics**: Track visits by device type (mobile, desktop, etc.)
- **Real-time Statistics**: View total links and visits on dashboard

### Public Profile Pages
- **Custom URLs**: Share your profile at `/username`
- **Responsive Design**: Optimized for all devices
- **Social Links**: Display connected social media accounts
- **Ordered Links**: Links appear in your custom order

### Internationalization
- **Multi-language Support**: English and Spanish localization
- **Auto-detection**: Automatically detects browser language
- **Fallback System**: Graceful handling of missing translations

## Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Material-UI (MUI)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Drag & Drop**: @dnd-kit
- **Routing**: React Router
- **Deployment**: Netlify-ready

## Getting Started

### Prerequisites
- Node.js 16+
- Firebase project

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/linkCreator.git
cd linkCreator
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
- Create a Firebase project
- Enable Authentication (Email/Password)
- Create Firestore database
- Add your Firebase config to `src/firebase/init.js`

4. Start development server
```bash
npm run dev
```

## Usage

1. **Register**: Create an account with email and username
2. **Setup Profile**: Add description, avatar, and social links
3. **Add Links**: Create your important links
4. **Customize Order**: Drag and drop to reorder links
5. **Share**: Share your profile at `yoursite.com/username`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── Dashboard/      # User dashboard pages
│   └── ...            # Public pages
├── firebase/           # Firebase configuration and utilities
├── locales/           # Internationalization files
├── utils/             # Utility functions
└── router/            # Application routing
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For support or questions, contact: me@twozer00.dev
