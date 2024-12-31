// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getProfessorRating") {
    const professorName = message.professorName;
    const query = encodeURIComponent(professorName);
    const url = `https://www.ratemyprofessors.com/search/professors/340?q=${query}`;

    // Fetch the professor's profile page HTML
    fetch(url)
      .then(response => response.text())
      .then(html => {
        // Send the raw HTML content to the content script
        sendResponse({ html: html });
      })
      .catch(error => {
        console.error("Error fetching professor rating:", error);
        sendResponse({ error: "Failed to fetch professor rating" });
      });

    // Ensure that the response is asynchronous
    return true;
  }
});
