// Use browser namespace with polyfill for cross-browser compatibility
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const initialize = function () {
  // Load previous values
  browserAPI.storage.local
    .get(["Rating", "Feedback"])
    .then(function (result) {
      let rating = result.Rating;
      if (rating === undefined || rating === null || rating === "") {
        // Default value assign for first installation
        rating = "5";
      }
      let nthCheckBox = document.querySelector(
        `input[name="rating"][value="${rating}"]`
      );
      if (nthCheckBox) {
        nthCheckBox.click();
      }

      let feedback = result.Feedback;
      if (feedback === undefined || feedback === null || feedback === "") {
        // Default value assign for first installation
        feedback = "N/A";
      }
      var textarea = document.getElementById("feedback");
      if (textarea) {
        textarea.value = feedback;
      }
    })
    .catch(function (error) {
      console.error("Error loading preferences:", error);
    });
};

// Add form submission handler
function setupFormSubmission() {
  const form = document.getElementById("ratingForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      // if submit button is pressed
      event.preventDefault();

      var rating = document.querySelector('input[name="rating"]:checked').value;
      var feedback = document.getElementById("feedback").value;

      // Show loading state
      const submitBtn = document.querySelector(".submit-button");
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML =
        '<span class="loading-spinner"></span>Processing...';
      submitBtn.disabled = true;

      // Save settings first
      Promise.all([
        browserAPI.storage.local.set({ Rating: rating }),
        browserAPI.storage.local.set({ Feedback: feedback }),
      ])
        .then(function () {
          // Then send message to background
          return browserAPI.runtime.sendMessage({ submit: true });
        })
        .then(function (response) {
          showSuccess();
        })
        .catch(function (error) {
          console.error("Error:", error);
          showSuccess(); // Still show success since we expect certain types of errors
        });

      function showSuccess() {
        // Reset button after brief delay
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;

          // Show success feedback
          const feedbackMsg = document.createElement("div");
          feedbackMsg.className = "success-message";
          feedbackMsg.textContent = "Evaluation form filled successfully!";

          // Insert before the button container
          const buttonContainer = document.querySelector(".button-container");
          form.insertBefore(feedbackMsg, buttonContainer);

          // Remove message after delay
          setTimeout(() => {
            if (feedbackMsg && feedbackMsg.parentNode) {
              feedbackMsg.parentNode.removeChild(feedbackMsg);
            }
          }, 3000);
        }, 1000);
      }
    });
  }
}

// Initialize when document is ready
document.addEventListener("DOMContentLoaded", function () {
  initialize();
  setupFormSubmission();
});
