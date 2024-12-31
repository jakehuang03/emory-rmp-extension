// Cache to store fetched professor ratings
const fetchedProfessors = new Set();

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(() => {
  // Look for professor links after a class is clicked and professor details are loaded
  const professorLinks = document.querySelectorAll(".instructor-name a");

  professorLinks.forEach((professorLink) => {
    const professorName = professorLink.textContent.trim();

    // Check if the professor's rating has already been fetched
    if (!fetchedProfessors.has(professorName)) {
    //   console.log("Fetching rating for professor:", professorName);
      fetchProfessorRating(professorName, professorLink);
    } else {
    //   console.log(`Rating for ${professorName} already fetched, skipping.`);
    }
  });
});

// Start observing for changes in the body (or a more specific container if needed)
observer.observe(document.body, { childList: true, subtree: true });

// Function to fetch professor's rating
function fetchProfessorRating(professorName, professorLinkElement) {
  // Send a request to the background script to get the professor's rating
  chrome.runtime.sendMessage(
    { action: "getProfessorRating", professorName: professorName },
    (response) => {
      if (response.error) {
        console.error("Error fetching professor rating:", response.error);
        return;
      }

      // Parse the HTML using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.html, "text/html");

      // Find the professor's rating and profile link in the parsed HTML
      const ratingElement = doc.querySelector(".CardNumRating__CardNumRatingNumber-sc-17t4b9u-2");
      const rating = ratingElement ? ratingElement.textContent.trim() : "No rating available";
      const profileLinkElement = doc.querySelector(".TeacherCard__StyledTeacherCard-syjs0d-0");
      const profileLink = profileLinkElement ? `https://www.ratemyprofessors.com${profileLinkElement.getAttribute("href")}` : "#";

      // Ensure the name from RMP matches the professor name in the UI
      const rmpProfessorNameElement = doc.querySelector(".CardName__StyledCardName-sc-1gyrgim-0");
      const rmpProfessorName = rmpProfessorNameElement ? rmpProfessorNameElement.textContent.trim() : null;

      // Only proceed if the names match
      if (rmpProfessorName && rmpProfessorName.toLowerCase() === professorName.toLowerCase()) {
        // Create a new element to display the rating (rating is now a clickable link)
        const ratingElementDisplay = document.createElement("span");
        ratingElementDisplay.style.marginLeft = "10px"; // Adjust the spacing as needed
        ratingElementDisplay.innerHTML = `
          <a href="${profileLink}" target="_blank" style="text-decoration: none;">
            <strong>Rating:</strong> ${rating}
          </a>
        `;

        // Append the rating element after the professor's name
        professorLinkElement.parentNode.appendChild(ratingElementDisplay);

        // Add professor to the fetched set to avoid refetching
        fetchedProfessors.add(professorName);
      } else {
        // console.log(`RMP name '${rmpProfessorName}' does not match '${professorName}', skipping.`);
      }
    }
  );
}
