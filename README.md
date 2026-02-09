# BizFlow - Business Dashboard

A modern, responsive business management dashboard for tracking assignments, research reports, customer payments, and subscriptions.

![Dashboard Preview](https://via.placeholder.com/800x400/0f172a/ffffff?text=BizFlow+Dashboard)

## ✨ Features

- **📊 Dashboard Overview** - Quick stats for income, pending payments, active projects, and customers
- **👥 Customer Management** - Searchable customer database with mobile number lookup
- **📁 Project Tracking** - Track assignments with deadlines, status, and payment progress
- **💰 Finance Management** - Track income & expenses across 3 bank accounts
- **🔄 Subscription Manager** - Monitor recurring payments with renewal alerts
- **📱 Mobile Responsive** - Works perfectly on laptop and mobile devices
- **🌙 Beautiful Dark Theme** - Premium glassmorphism design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend**: Google Apps Script (Free!)
- **Database**: Google Spreadsheet (Free!)
- **Hosting**: GitHub Pages (Free!)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Account (for backend)
- GitHub Account (for hosting)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bizflow-dashboard.git
   cd bizflow-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Backend Setup (Google Apps Script)

See detailed instructions in [gas/README.md](./gas/README.md)

Quick steps:
1. Create a Google Spreadsheet with 4 sheets: Customers, Projects, Transactions, Subscriptions
2. Copy the Spreadsheet ID from the URL
3. Create a new Google Apps Script project
4. Paste the code from `gas/Code.gs`
5. Update the `SPREADSHEET_ID` constant
6. Run `setupSheets` function once
7. Deploy as Web App (Anyone access)
8. Copy the Web App URL to `src/services/api.js`

### Deploy to GitHub Pages

1. **Update vite.config.js**
   ```javascript
   base: '/your-repo-name/'
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to Repository Settings → Pages
   - Source: GitHub Actions
   - The workflow will auto-deploy on push to main

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx       # Overview stats
│   │   ├── Customers.jsx       # Customer management
│   │   ├── Projects.jsx        # Project tracking
│   │   ├── Finance.jsx         # Income/expense tracking
│   │   └── Subscriptions.jsx   # Subscription management
│   ├── services/
│   │   └── api.js              # Google Apps Script API client
│   ├── App.jsx                 # Routes configuration
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind + custom styles
├── gas/
│   ├── Code.gs                 # Google Apps Script backend
│   └── README.md               # Backend setup instructions
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
└── package.json
```

## 🎨 Customization

### Bank Accounts
Edit the `bankAccounts` array in:
- `src/pages/Projects.jsx`
- `src/pages/Finance.jsx`

### Project Types
Edit the `projectTypes` array in:
- `src/pages/Projects.jsx`

### Colors
Modify `tailwind.config.js` to change the color scheme.

## 📱 Mobile Usage

The dashboard is fully responsive. Access it from any mobile browser using your GitHub Pages URL or custom domain.

## 🔐 Security Notes

- The Google Apps Script API uses "Anyone" access for simplicity
- The URL acts as a secret - don't share it publicly
- For production, consider implementing:
  - API key authentication
  - OAuth2 for user-specific data
  - Firebase or Supabase for better security

## 📄 License

MIT License - feel free to use for your personal or commercial projects.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Made with ❤️ for freelancers and small business owners
