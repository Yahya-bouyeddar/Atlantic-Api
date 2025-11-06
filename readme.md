# BON DE COULAGE - React Frontend

Modern React frontend for the BON DE COULAGE Excel-to-PDF API.

## 🚀 Quick Start

### Development Mode

1. **Start the backend server first:**
   ```bash
   # In the root bon-api directory
   npm start
   ```
   Backend will run on http://localhost:3000

2. **Start the React development server:**
   ```bash
   cd client
   npm install
   npm start
   ```
   React app will run on http://localhost:3001

The React app is configured to proxy API requests to the backend server.

## 📦 Building for Production

### Option 1: Serve from Backend

Build the React app and serve it from the Express server:

```bash
cd client
npm run build
```

This creates an optimized production build in the `client/build` folder.

Then update your backend `server.js` to serve the React build:

```javascript
// Add this to server.js after routes
const path = require('path');

// Serve React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
```

### Option 2: Deploy Separately

Deploy the React app to Vercel/Netlify and the backend to a VPS.

Update the API calls in React to point to your backend URL:

```javascript
// In client/src/App.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

## 🎨 Features

- ✅ Modern React 18 with Hooks
- ✅ File upload with drag & drop
- ✅ Excel data preview
- ✅ Multi-page PDF generation
- ✅ Real-time validation
- ✅ Loading states
- ✅ Success/error alerts
- ✅ Responsive design
- ✅ API documentation tab

## 📁 Project Structure

```
client/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Alert.js           # Alert notifications
│   │   ├── Alert.css
│   │   ├── ExcelUpload.js     # File upload component
│   │   ├── ExcelUpload.css
│   │   ├── ProjectForm.js     # Project info form
│   │   ├── ProjectForm.css
│   │   ├── PreviewData.js     # Data preview table
│   │   └── PreviewData.css
│   ├── App.js                  # Main app component
│   ├── App.css
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── package.json
└── README.md                   # This file
```

## 🔧 Configuration

### Proxy Configuration

The `proxy` field in `package.json` is set to `http://localhost:3000` to forward API requests to the backend during development.

### Environment Variables

Create `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:3000
```

## 🎯 API Integration

The React app communicates with the backend API:

- `POST /api/bon/generate-from-excel` - Generate PDF from Excel
- `POST /api/bon/preview-excel` - Preview Excel data
- `GET /api/bon/docs` - API documentation

## 🎨 Customization

### Change Colors

Edit the gradient colors in `src/index.css`:

```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Change Form Fields

Edit `src/components/ProjectForm.js` to add/remove fields.

### Change API Endpoint

Update the axios calls in `src/App.js`.

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🧪 Testing

```bash
npm test
```

## 🏗️ Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## 🚀 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Drag and drop the build folder to Netlify
```

## 🔒 CORS Configuration

Make sure your backend has CORS enabled for the React app origin:

```javascript
// In backend server.js
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3001', 'https://your-frontend-url.com']
}));
```

## 💡 Tips

- Use Chrome DevTools for debugging
- Check Network tab for API calls
- Use React DevTools extension
- Enable source maps for better debugging

## 📝 License
MIT