# Google Apps Script Backend Setup

This folder contains the backend code for your BizFlow Dashboard using Google Apps Script (GAS).

## Setup Instructions

### Step 1: Create a Google Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Copy the **Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the part between `/d/` and `/edit`

### Step 2: Create Sheet Tabs
Create the following 4 sheets (tabs) in your spreadsheet:
- `Customers`
- `Projects`
- `Transactions`
- `Subscriptions`

### Step 3: Create Google Apps Script Project
1. Go to [Google Apps Script](https://script.google.com)
2. Click **New Project**
3. Name it "BizFlow Dashboard API"
4. Delete any existing code
5. Copy the entire contents of `Code.gs` and paste it

### Step 4: Configure the Script
1. Find this line in the code:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
2. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID

### Step 5: Set Up Headers (Run Once)
1. In the Apps Script editor, select the function `setupSheets` from the dropdown
2. Click **Run**
3. Grant permissions when prompted
4. This will set up the column headers in your sheets

### Step 6: Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Configure:
   - Description: "BizFlow API v1"
   - Execute as: **Me**
   - Who has access: **Anyone** (required for the frontend to access)
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the frontend

### Step 7: Update Frontend
1. Create a file `src/services/api.js` in your React project
2. Paste the Web App URL as the `API_BASE_URL`

## API Endpoints

### GET Requests
- `?action=getAll&sheet=Customers` - Get all customers
- `?action=getAll&sheet=Projects` - Get all projects
- `?action=getAll&sheet=Transactions` - Get all transactions
- `?action=getAll&sheet=Subscriptions` - Get all subscriptions
- `?action=getStats` - Get dashboard statistics
- `?action=search&query=John` - Search customers by name or mobile

### POST Requests
Send JSON body with:
- `{ action: "add", sheet: "Customers", payload: {...} }` - Add new record
- `{ action: "update", sheet: "Customers", id: 2, payload: {...} }` - Update record
- `{ action: "delete", sheet: "Customers", id: 2 }` - Delete record

## Security Notes
- The API is set to "Anyone" access, which means anyone with the URL can access it
- Since only your app knows the URL, this provides basic "security through obscurity"
- For production use, consider implementing API keys or OAuth2
