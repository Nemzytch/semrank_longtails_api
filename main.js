const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

app.use(cors());

let browser, page;

async function initPuppeteer() {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();

    // Log in to the website
    await page.goto('https://mangools.com/users/sign_in', { waitUntil: 'networkidle0' });
    await page.type('#user_email', 'nemzytch@gmail.com');
    await page.type('#user_password', 'ZZrot34**');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

initPuppeteer();


app.post('/process', async (req, res) => {
    const { search } = req.body;
    let responseData = [];

    if (!search) {
        return res.status(400).send({ error: 'search is required' });
    }

    try {
        const url = `https://app.mangools.com/kwfinder/dashboard?language_id=1002&location_id=2250&query=${encodeURI(search)}&source_id=0&sub_source_id=0`;
        // Set up response listener before navigating
        page.on('response', async response => {
            if (response.url().includes('related-keywords') && response.ok()) {
                try {
                    const responseJson = await response.json();
                    responseData.push(responseJson);
                } catch (error) {
                    console.error('Error processing response for:', response.url(), error.message);
                }
            }
        });

        await page.goto(url, { waitUntil: 'networkidle0' });

        res.send({ message: 'Page processed successfully', data: responseData });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});