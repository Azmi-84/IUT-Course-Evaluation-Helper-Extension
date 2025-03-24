// Use browser namespace with polyfill for cross-browser compatibility
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const fillTheTextBoxes = function () {
  return browserAPI.storage.local
    .get("Feedback")
    .then(function (result) {
      let feedback = result.Feedback;
      if (feedback === undefined || feedback === null || feedback === "") {
        feedback = "N/A";
      }

      var textareas = document.getElementsByClassName("form-control");
      if (textareas.length === 0) {
        console.warn("No textareas found with class 'form-control'");
        return false;
      }

      for (let i = 0; i < textareas.length; i++) {
        textareas[i].value = feedback;

        // trigger the user interaction true
        textareas[i].dispatchEvent(new Event("input", { bubbles: true }));
        textareas[i].dispatchEvent(new Event("change", { bubbles: true }));
      }

      return true;
    })
    .catch(function (error) {
      console.error("Error filling textboxes:", error);
      return false;
    });
};

const checkTheRadios = function () {
  return browserAPI.storage.local
    .get("Rating")
    .then(function (result) {
      let rating = result.Rating;
      let nthCheckBox = document.querySelectorAll(
        `input[type="radio"][value="${rating}"]`
      );

      if (nthCheckBox.length === 0) {
        console.warn(`No radio buttons found with value ${rating}`);
        return false;
      }

      for (let i = 0; i < nthCheckBox.length; i++) {
        nthCheckBox[i].click();
      }

      return true;
    })
    .catch(function (error) {
      console.error("Error checking radio buttons:", error);
      return false;
    });
};

const showFeedback = function () {
  // Create feedback element
  const feedbackDiv = document.createElement("div");
  feedbackDiv.style.position = "fixed";
  feedbackDiv.style.top = "20px";
  feedbackDiv.style.right = "20px";
  feedbackDiv.style.padding = "10px 20px";
  feedbackDiv.style.background = "#4CAF50";
  feedbackDiv.style.color = "white";
  feedbackDiv.style.borderRadius = "4px";
  feedbackDiv.style.zIndex = "10000";
  feedbackDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  feedbackDiv.textContent = "Evaluation form filled successfully!";

  document.body.appendChild(feedbackDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    if (feedbackDiv && feedbackDiv.parentNode) {
      feedbackDiv.parentNode.removeChild(feedbackDiv);
    }
  }, 3000);
};

const evaluate = function () {
  Promise.all([fillTheTextBoxes(), checkTheRadios()])
    .then(function (results) {
      showFeedback();
      return { success: true };
    })
    .catch(function (error) {
      console.error("Evaluation failed:", error);
      return { success: false, error: error.message };
    });
};

// Listen for messages using promise-based API
browserAPI.runtime.onMessage.addListener(function (request, sender) {
  if (request.message == "Start Evaluate") {
    return evaluate();
  }
});

// Ensure functionality works when document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    console.log("IUT Evaluation Helper: Content script loaded and ready");
  });
} else {
  console.log(
    "IUT Evaluation Helper: Content script loaded and ready (document already loaded)"
  );
}
