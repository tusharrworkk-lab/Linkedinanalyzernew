import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Main LinkedIn API Proxy Route
app.get('/api/linkedin/analytics', async (req, res) => {
  try {
    const { 
      token, 
      urn, 
      startDate, 
      endDate, 
      queryType = 'REACTION', 
      aggregation = 'DAILY',
      version = '202404' 
    } = req.query;

    if (!token || !urn || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters: token, urn, startDate, endDate' });
    }

    const { startDay, startMonth, startYear } = JSON.parse(startDate);
    const { endDay, endMonth, endYear } = JSON.parse(endDate);

    const urnWithoutSharePrefix = urn.replace('share:urn:li:share:', 'urn:li:share:');

    // Make the request using exactly the parameters from the curl command provided
    const url = `https://api.linkedin.com/rest/memberCreatorPostAnalytics?q=entity&entity=(share:${urnWithoutSharePrefix})&queryType=${queryType}&aggregation=${aggregation}&dateRange=(start:(day:${startDay},month:${startMonth},year:${startYear}),end:(day:${endDay},month:${endMonth},year:${endYear}))`;

    const response = await axios.get(url, {
      headers: {
        'X-Restli-Protocol-Version': '2.0.0',
        'Authorization': `Bearer ${token}`,
        'Linkedin-Version': version,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('LinkedIn API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch LinkedIn data', 
      details: error.response?.data || error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
