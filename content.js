(() => {
  const overlayId = "fireproof-overlay";
  const existingOverlay = document.getElementById(overlayId);

  function hideOverlay(overlay) {
    overlay.style.transform = "translateX(100%)";
    console.log("Fireproof overlay hidden");
  }

  function showOverlay(overlay) {
    overlay.style.transform = "translateX(0)";
    console.log("Fireproof overlay shown");
  }

  if (existingOverlay) {
    // If the overlay exists, toggle its visibility
    if (existingOverlay.style.transform === "translateX(0px)") {
      hideOverlay(existingOverlay);
    } else {
      showOverlay(existingOverlay);
    }
  } else {
    // If the overlay doesn't exist, create and inject it
    const jsFiles = [
      "/assets/__vite-browser-external-Dq6FBzox.js",
      "/assets/gateway-7OM6OSYK-CNqGBlqM.js",
      "/assets/index-B0W44gDG.js",
      "/assets/index-DaMzc1tV.js",
      "/assets/key-bag-indexdb-BWEM53ZX-Ca8QT7Zz.js",
    ];
    const css = chrome.runtime.getURL("/assets/index-DRzwk_cv.css");
    console.log(jsFiles, css);

    const overlayContainer = document.createElement("div");
    overlayContainer.id = overlayId;
    overlayContainer.style.transform = "translateX(100%)";
    document.body.appendChild(overlayContainer);

    const shadowRoot = overlayContainer.attachShadow({ mode: "open" });

    let overlayHTML = `
      <style>
        :host {
          /* Reset specific CSS properties */
          color: initial;

          /* Reset all CSS properties */
          all: initial;
          position: fixed;
          top: 0;
          right: 0;
          width: 900px;
          height: 100%;
          background-color: white;
          z-index: 9999;
          overflow: auto;
          // padding: 20px;
          transition: transform 0.3s ease-in;
          box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        }
        #close-fireproof-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          background-color: #f44336;
          color: white;
          border: none;
          cursor: pointer;
        }
        #root {
          // padding: 20px;
          background-color: var(--background);
        }
        #resizer {
          position: absolute;
          top: 0;
          left: -20px; /* Increase the resize area */
          width: 30px; /* Increase the resize area */
          height: 100%;
          cursor: ew-resize;
          z-index: 10000;
        }
    `;

    // Fetch the CSS content and append it to overlayHTML
    fetch(css)
      .then((response) => response.text())
      .then((styleContent) => {
        // Extract variables from the fetched CSS
        const variableRegex = /:root\s*{([^}]*)}/;
        const match = styleContent.match(variableRegex);
        if (match) {
          const variables = match[1];
          overlayHTML = overlayHTML.replace(":host {", `:host {\n${variables}`);
        }

        overlayHTML += styleContent;
        overlayHTML += `
      </style>
      <div id="overlay-content">
        <div id="resizer"></div>
        <button id="close-fireproof-overlay">Close</button>
        <div id="root"></div>
      </div>
    `;
        shadowRoot.innerHTML = overlayHTML;

        jsFiles.forEach((jsFile) => {
          const scriptTag = document.createElement("script");
          scriptTag.setAttribute("type", "module");
          scriptTag.setAttribute("src", chrome.runtime.getURL(jsFile));
          shadowRoot.appendChild(scriptTag);
        });

        const closeButton = shadowRoot.getElementById(
          "close-fireproof-overlay"
        );
        closeButton.addEventListener("click", () => {
          hideOverlay(overlayContainer);
        });

        // Close overlay when clicking outside
        document.addEventListener("click", (event) => {
          if (
            !overlayContainer.contains(event.target) &&
            overlayContainer.style.transform === "translateX(0px)"
          ) {
            hideOverlay(overlayContainer);
          }
        });

        // Close overlay when pressing Esc key
        document.addEventListener("keydown", (event) => {
          if (
            event.key === "Escape" &&
            overlayContainer.style.transform === "translateX(0px)"
          ) {
            hideOverlay(overlayContainer);
          }
        });

        // Animate the overlay sliding in
        requestAnimationFrame(() => {
          showOverlay(overlayContainer);
        });

        console.log("Fireproof overlay injected and shown");

        // Make the overlay resizable from the left
        const resizer = shadowRoot.getElementById("resizer");
        let isResizing = false;

        resizer.addEventListener("mousedown", (e) => {
          isResizing = true;
          document.addEventListener("mousemove", resizeOverlay);
          document.addEventListener("mouseup", stopResizing);
          // Disable text selection on the overlay
          overlayContainer.style.userSelect = "none";
        });

        function resizeOverlay(e) {
          if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            overlayContainer.style.width = `${newWidth}px`;
            // Keep the cursor in place
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
          }
        }

        function stopResizing() {
          isResizing = false;
          document.removeEventListener("mousemove", resizeOverlay);
          document.removeEventListener("mouseup", stopResizing);
          // Reset cursor style
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
          // Re-enable text selection on the overlay
          overlayContainer.style.userSelect = "";
        }
      })
      .catch((error) => console.error("Error loading CSS:", error));
  }
})();
