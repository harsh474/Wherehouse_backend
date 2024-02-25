
const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const port = 3001;
app.use(bodyParser.json());
app.use(cors());

const credentials = require('./credentials.json'); 
app.get('/api/sheetData', async (req, res) => {
  try {
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1pAU6ko5F9941XZcrghESm1Ki8cWF77wcBeLn9NChpNs'; 

    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1', 
    });

    const sheetData = response.data.values;
    const numColumns = sheetData[0].length;
    const numRows = sheetData.length;

  
    const range = `Sheet1!A1:${String.fromCharCode(64 + numColumns)}${numRows}`;

   
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const valuesData = valuesResponse.data.values;
    res.json(valuesData);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Error fetching sheet data' });
  }
});
app.post('/api/sheetUpdates', async (req, res) => {
  try {
  
    const sheetData = await fetchSheetData();

    res.status(200).send('Received sheet update notification');
  } catch (error) {
    console.error('Error handling sheet update notification:', error);
    res.status(500).json({ error: 'Error handling sheet update notification' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
