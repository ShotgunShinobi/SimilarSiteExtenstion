# Similar Sites Finder - Chrome Extension

## Description

**Similar Sites Finder** is a Chrome extension that helps users discover websites similar to the one they are currently browsing. By leveraging the power of the Gemini AI, it provides relevant website suggestions, making it easier to find alternative resources, competitors, or related content.

When activated, the extension fetches the URL of the active tab and sends a request to the Gemini API. The API then returns a list of websites it deems similar, which are displayed 깔끔하게 in the extension's popup.

## Features

* **One-Click Similarity Search:** Instantly find websites similar to your current tab.
* **AI-Powered Suggestions:** Utilizes the Gemini API for intelligent website recommendations.
* **User-Friendly Interface:** Clean and simple popup displaying the current site and suggestions.
* **Direct Links:** Clickable links to the suggested websites, opening in a new tab.
* **Responsive Popup:** The popup is designed to be clear and usable.
* **Loading & Error States:** Provides feedback to the user during API calls or if issues arise.

## How to Install and Use

### Prerequisites

* Google Chrome browser.

### Installation Steps

1.  **Download the Extension Files:**
    * Clone this repository or download the ZIP file and extract it to a folder on your computer.
    * You should have the following files and folder structure:
        ```
        similar-sites-extension/
        ├── manifest.json
        ├── popup.html
        ├── popup.js
        └── images/
            ├── icon16.png
            ├── icon48.png
            └── icon128.png
        ```
    * *(Note: You'll need to create placeholder `icon16.png`, `icon48.png`, and `icon128.png` files in the `images` folder if they are not already present.)*

2.  **Load the Extension in Chrome:**
    * Open Google Chrome.
    * Navigate to `chrome://extensions`.
    * Enable **Developer mode** using the toggle switch (usually in the top-right corner).
    * Click on the **"Load unpacked"** button.
    * Select the `similar-sites-extension` folder (the one containing `manifest.json`).

3.  **Using the Extension:**
    * Once loaded, the "Similar Sites Finder" icon will appear in your Chrome toolbar (you might need to pin it from the extensions puzzle icon).
    * Navigate to any website for which you want to find similar alternatives.
    * Click the extension icon.
    * The popup will display the current website's URL and then list suggested similar sites.
    * Click on any suggested link to open it in a new tab.

## Project Structure

* **`manifest.json`**: Defines the extension's properties, permissions, and core files. It specifies that the extension needs access to the `activeTab` to get the current URL and `storage` (though not actively used in the current version, it's a common permission). It also includes `host_permissions` for the Gemini API endpoint.
* **`popup.html`**: The HTML structure for the extension's popup window. It includes elements to display the current site, the list of similar sites, and loading/message indicators. Tailwind CSS is used for styling.
* **`popup.js`**: Contains the JavaScript logic for the extension. This script:
    * Gets the URL of the currently active tab.
    * Constructs and sends a request to the Gemini API with the current URL.
    * Parses the JSON response from the API.
    * Dynamically updates `popup.html` to display the suggested similar websites.
    * Handles loading states and basic error messages.
* **`images/`**: This folder contains the icons for the extension (`icon16.png`, `icon48.png`, `icon128.png`).

## Technologies Used

* **HTML5**
* **CSS3 (Tailwind CSS)**
* **JavaScript (ES6+)**
* **Chrome Extension APIs** (`chrome.tabs`)
* **Gemini API** (for generating similar website suggestions)

## How it Works

1.  The user clicks the extension icon.
2.  `popup.js` executes and first attempts to get the URL of the active tab using `chrome.tabs.query`.
3.  The current URL is displayed in the popup.
4.  A prompt is constructed asking the Gemini API to list similar websites to the current URL, requesting the output in a specific JSON format.
5.  A `fetch` request is made to the Gemini API endpoint (`https://generativelanguage.googleapis.com/.../gemini-2.0-flash:generateContent`).
6.  The API processes the prompt and returns a JSON object containing an array of suggested website URLs.
7.  `popup.js` parses this JSON response.
8.  The list of similar sites is then dynamically rendered as clickable links in `popup.html`.

## Potential Future Enhancements

* **API Key Management:** Allow users to input their own Gemini API key via an options page (requires `storage` permission and an options HTML/JS).
* **Caching:** Cache results for recently visited URLs to reduce API calls and speed up display.
* **User Feedback:** Allow users to rate the quality of suggestions.
* **Advanced Filtering:** Options to filter suggestions by category or region.
* **Customizable Number of Suggestions:** Let users choose how many suggestions they want to see.
* **Error Handling:** More robust error handling and user-friendly messages for API failures or network issues.
* **UI/UX Improvements:** Enhanced styling and animations.

## Disclaimer

* This extension relies on the Gemini API for suggestions. The quality and availability of suggestions depend on the API.
* Ensure you comply with the Gemini API's terms of service. The API key is currently left blank in `popup.js` as per instructions for environments that handle it automatically. For local development or other deployment scenarios, you might need to manage the API key appropriately.

---
