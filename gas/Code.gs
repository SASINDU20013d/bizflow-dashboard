/**
 * BizFlow Dashboard - Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Copy this entire code into Code.gs
 * 3. Create a Google Spreadsheet and copy its ID from the URL
 * 4. Replace SPREADSHEET_ID below with your spreadsheet ID
 * 5. In the spreadsheet, create 4 sheets named: "Customers", "Projects", "Transactions", "Subscriptions"
 * 6. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 7. Copy the Web App URL and paste it in your frontend's api.js file
 */

// ============================================
// CONFIGURATION - UPDATE THIS!
// ============================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your Google Spreadsheet ID

// Sheet names
const SHEETS = {
  CUSTOMERS: 'Customers',
  PROJECTS: 'Projects',
  TRANSACTIONS: 'Transactions',
  SUBSCRIPTIONS: 'Subscriptions'
};

// ============================================
// MAIN HANDLERS
// ============================================

/**
 * Handle GET requests
 */
function doGet(e) {
  const action = e.parameter.action || 'getAll';
  const sheet = e.parameter.sheet;
  
  let result;
  
  try {
    switch(action) {
      case 'getAll':
        result = getAllData(sheet);
        break;
      case 'getStats':
        result = getDashboardStats();
        break;
      case 'search':
        result = searchCustomers(e.parameter.query);
        break;
      default:
        result = { error: 'Unknown action' };
    }
  } catch(error) {
    result = { error: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const sheet = data.sheet;
  
  let result;
  
  try {
    switch(action) {
      case 'add':
        result = addRow(sheet, data.payload);
        break;
      case 'update':
        result = updateRow(sheet, data.id, data.payload);
        break;
      case 'delete':
        result = deleteRow(sheet, data.id);
        break;
      default:
        result = { error: 'Unknown action' };
    }
  } catch(error) {
    result = { error: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// DATA OPERATIONS
// ============================================

/**
 * Get all data from a sheet
 */
function getAllData(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return { error: 'Sheet not found: ' + sheetName };
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map((row, index) => {
    const obj = { id: index + 2 }; // Row number (1-indexed, +1 for header)
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Add a new row to a sheet
 */
function addRow(sheetName, payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return { error: 'Sheet not found: ' + sheetName };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => payload[header] || '');
  
  // Generate ID if it's the first column and empty
  if (headers[0] === 'ID' && !payload['ID']) {
    const lastId = sheet.getLastRow() > 1 ? 
      sheet.getRange(sheet.getLastRow(), 1).getValue() : 0;
    newRow[0] = (parseInt(lastId) || 0) + 1;
  }
  
  sheet.appendRow(newRow);
  
  return { success: true, id: newRow[0] || sheet.getLastRow() };
}

/**
 * Update a row by its row number
 */
function updateRow(sheetName, rowNum, payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return { error: 'Sheet not found: ' + sheetName };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  headers.forEach((header, i) => {
    if (payload.hasOwnProperty(header)) {
      sheet.getRange(rowNum, i + 1).setValue(payload[header]);
    }
  });
  
  return { success: true };
}

/**
 * Delete a row by its row number
 */
function deleteRow(sheetName, rowNum) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return { error: 'Sheet not found: ' + sheetName };
  }
  
  sheet.deleteRow(rowNum);
  
  return { success: true };
}

/**
 * Search customers by name or mobile
 */
function searchCustomers(query) {
  const customers = getAllData(SHEETS.CUSTOMERS);
  
  if (customers.error) {
    return customers;
  }
  
  const searchTermLower = query.toLowerCase();
  
  return customers.filter(c => 
    (c.Name && c.Name.toLowerCase().includes(searchTermLower)) ||
    (c['Mobile Number'] && c['Mobile Number'].includes(query))
  );
}

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
  const customers = getAllData(SHEETS.CUSTOMERS) || [];
  const projects = getAllData(SHEETS.PROJECTS) || [];
  const transactions = getAllData(SHEETS.TRANSACTIONS) || [];
  const subscriptions = getAllData(SHEETS.SUBSCRIPTIONS) || [];
  
  // Filter out errors
  const validCustomers = Array.isArray(customers) ? customers : [];
  const validProjects = Array.isArray(projects) ? projects : [];
  const validTransactions = Array.isArray(transactions) ? transactions : [];
  const validSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];
  
  // Calculate stats
  const totalIncome = validTransactions
    .filter(t => t.Type === 'Income')
    .reduce((sum, t) => sum + (parseFloat(t.Amount) || 0), 0);
  
  const pendingPayments = validProjects
    .filter(p => p.Status !== 'Completed')
    .reduce((sum, p) => sum + ((parseFloat(p.Price) || 0) - (parseFloat(p['Paid Amount']) || 0)), 0);
  
  const activeProjects = validProjects.filter(p => p.Status !== 'Completed').length;
  const completedProjects = validProjects.filter(p => p.Status === 'Completed').length;
  
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingDeadlines = validProjects.filter(p => {
    const deadline = new Date(p.Deadline);
    return p.Status !== 'Completed' && deadline >= today && deadline <= weekFromNow;
  }).length;
  
  const monthlySubscriptions = validSubscriptions
    .filter(s => s['Active?'] === true || s['Active?'] === 'TRUE')
    .reduce((sum, s) => {
      const cost = parseFloat(s.Cost) || 0;
      return sum + (s.Cycle === 'Yearly' ? cost / 12 : cost);
    }, 0);
  
  return {
    totalIncome,
    pendingPayments,
    activeProjects,
    completedProjects,
    totalCustomers: validCustomers.length,
    upcomingDeadlines,
    monthlySubscriptions
  };
}

// ============================================
// INITIAL SETUP HELPER
// ============================================

/**
 * Run this function once to set up headers in your sheets
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Customers headers
  const customersSheet = ss.getSheetByName(SHEETS.CUSTOMERS) || ss.insertSheet(SHEETS.CUSTOMERS);
  customersSheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Mobile Number', 'Email', 'Notes']]);
  
  // Projects headers
  const projectsSheet = ss.getSheetByName(SHEETS.PROJECTS) || ss.insertSheet(SHEETS.PROJECTS);
  projectsSheet.getRange(1, 1, 1, 9).setValues([['ID', 'Customer ID', 'Project Type', 'Status', 'Deadline', 'Price', 'Paid Amount', 'Bank Account', 'Notes']]);
  
  // Transactions headers
  const transactionsSheet = ss.getSheetByName(SHEETS.TRANSACTIONS) || ss.insertSheet(SHEETS.TRANSACTIONS);
  transactionsSheet.getRange(1, 1, 1, 6).setValues([['Date', 'Type', 'Category', 'Amount', 'Account', 'Description']]);
  
  // Subscriptions headers
  const subscriptionsSheet = ss.getSheetByName(SHEETS.SUBSCRIPTIONS) || ss.insertSheet(SHEETS.SUBSCRIPTIONS);
  subscriptionsSheet.getRange(1, 1, 1, 5).setValues([['Service Name', 'Cost', 'Cycle', 'Next Renewal Date', 'Active?']]);
  
  Logger.log('Sheets setup complete!');
}
