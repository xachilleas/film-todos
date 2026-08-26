import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

async function testOMDb() {
    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey) {
        console.error("OMD_API_KEY not found in .env");
        return;
    }

    console.log("API KEY FOUND: ", apiKey.slice(0, 5) + "...")

    try {
        const response = await axios.get('https://www.omdbapi.com/', {
            params: {
                apikey: apiKey,
                t: 'Stranger than paradise',
                type: 'movie'
            }
        });
        if (response.data.Response === 'True') {
            console.log('API works!');
            console.log('Movie found: ', response.data.Title, '(', response.data.Year, ')');
        } else {
            console.log("Api returned error: ", response.data.Error);
        }
        } catch (error)
        {
            if (error instanceof Error) {
                console.error('❌ Request failed:', error.message);
            } else {
                console.error('❌ Request failed:', error);
            }
        }
    }
testOMDb();