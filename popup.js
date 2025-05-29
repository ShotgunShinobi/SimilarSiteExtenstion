// popup.js

// DOM Elements
const currentSiteElement = document.getElementById('currentSite');
const similarSitesListElement = document.getElementById('similarSitesList');
const messageElement = document.getElementById('message');
const loaderElement = document.getElementById('loader');

// Gemini API Configuration
const apiKey = ""; // Per instructions, leave empty. Will be handled by the environment.
const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

/**
 * Fetches the URL of the currently active tab.
 * @returns {Promise<string|null>} A promise that resolves with the URL or null if an error occurs.
 */
async function getCurrentTabUrl() {
    return new Promise((resolve) => {
        // Check if chrome.tabs is available (it should be in an extension popup)
        if (chrome && chrome.tabs && chrome.tabs.query) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0 && tabs[0].url) {
                    resolve(tabs[0].url);
                } else {
                    console.error("Could not get current tab URL. Tabs:", tabs);
                    resolve(null);
                }
            });
        } else {
            console.error("chrome.tabs.query is not available. Are you running this in an extension popup?");
            // Fallback for local testing (won't work in actual extension)
            resolve("https://example.com"); // Placeholder for local testing
        }
    });
}

/**
 * Calls the Gemini API to find websites similar to the given URL.
 * @param {string} siteUrl The URL to find similar sites for.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of similar site URLs.
 */
async function fetchSimilarSites(siteUrl) {
    if (!siteUrl) {
        return [];
    }

    // More descriptive prompt for better results and JSON output
    const prompt = `List up to 5 websites that are functionally similar or offer similar content to "${siteUrl}". Consider the primary purpose and audience of the given URL. Provide your answer ONLY as a JSON object with a single key "similarWebsites" whose value is an array of strings, where each string is a fully qualified URL. For example: {"similarWebsites": ["https://example.com", "https://another.example.com"]}. If you cannot find any similar websites, return an empty array for "similarWebsites".`;

    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            responseMimeType: "application/json",
            // Define the schema for the expected JSON output
            responseSchema: {
                type: "OBJECT",
                properties: {
                    similarWebsites: {
                        type: "ARRAY",
                        items: {
                            type: "STRING",
                            description: "A URL of a similar website (e.g., https://www.example.com)"
                        }
                    }
                },
                required: ["similarWebsites"]
            }
        }
    };

    try {
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API request failed:", response.status, errorBody);
            throw new Error(`API request failed with status ${response.status}. Details: ${errorBody}`);
        }

        const result = await response.json();

        // Detailed logging of API response for debugging
        // console.log("Gemini API Full Response:", JSON.stringify(result, null, 2));

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0 &&
            result.candidates[0].content.parts[0].text) {
            
            const jsonText = result.candidates[0].content.parts[0].text;
            // console.log("Raw JSON text from API:", jsonText);

            try {
                const parsedJson = JSON.parse(jsonText);
                if (parsedJson && parsedJson.similarWebsites && Array.isArray(parsedJson.similarWebsites)) {
                    // Filter out any non-string or empty string items, and ensure they are valid URLs (basic check)
                    return parsedJson.similarWebsites.filter(url => 
                        typeof url === 'string' && 
                        url.trim() !== '' &&
                        (url.startsWith('http://') || url.startsWith('https://'))
                    );
                } else {
                    console.warn("Parsed JSON does not have the expected 'similarWebsites' array structure:", parsedJson);
                    return [];
                }
            } catch (e) {
                console.error("Failed to parse JSON from API response:", e, "Raw text was:", jsonText);
                return [];
            }
        } else {
            console.warn("No valid candidates or content parts in API response:", result);
            return [];
        }
    } catch (error) {
        console.error("Error fetching similar sites:", error);
        messageElement.textContent = `Error: ${error.message}`;
        return [];
    }
}

/**
 * Displays the list of similar websites in the popup.
 * @param {Array<string>} sites An array of similar site URLs.
 */
function displaySimilarSites(sites) {
    similarSitesListElement.innerHTML = ''; // Clear previous list

    if (sites.length === 0) {
        messageElement.textContent = 'No similar sites found or API error.';
        return;
    }

    messageElement.style.display = 'none'; // Hide loading/error message

    sites.forEach(site => {
        const listItem = document.createElement('li');
        listItem.classList.add('site-item', 'p-2', 'hover:bg-gray-100', 'rounded-md');

        const link = document.createElement('a');
        link.href = site;
        link.textContent = site;
        link.target = '_blank'; // Open in new tab
        link.classList.add('site-link', 'text-blue-600', 'hover:underline', 'block', 'truncate');
        
        // Tooltip for full URL if truncated
        link.title = site; 

        listItem.appendChild(link);
        similarSitesListElement.appendChild(listItem);
    });
}

/**
 * Main function to initialize the popup.
 */
async function main() {
    loaderElement.style.display = 'block'; // Show loader
    messageElement.textContent = 'Fetching current URL...';
    similarSitesListElement.innerHTML = ''; // Clear any existing list items

    const url = await getCurrentTabUrl();

    if (url) {
        currentSiteElement.textContent = url;
        currentSiteElement.title = url; // Add tooltip for long URLs
        messageElement.textContent = 'Finding similar sites...';
        
        try {
            const similarSites = await fetchSimilarSites(url);
            loaderElement.style.display = 'none'; // Hide loader
            displaySimilarSites(similarSites);
        } catch (error) {
            console.error("Error in main execution flow:", error);
            loaderElement.style.display = 'none'; // Hide loader
            messageElement.textContent = 'Failed to load suggestions. See console for details.';
        }
    } else {
        loaderElement.style.display = 'none'; // Hide loader
        currentSiteElement.textContent = 'N/A';
        messageElement.textContent = 'Could not determine the current site URL. Ensure you are on a valid webpage.';
    }
}

// Run the main function when the popup is loaded
document.addEventListener('DOMContentLoaded', main);
