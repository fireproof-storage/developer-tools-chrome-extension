(() => {
  const overlayId = "fireproof-overlay";
  const existingOverlay = document.getElementById(overlayId);

  if (existingOverlay) {
    // If the overlay exists, toggle its visibility
    if (existingOverlay.style.transform === "translateX(0px)") {
      // If visible, hide it
      existingOverlay.style.transform = "translateX(100%)";
      console.log("Fireproof overlay hidden");
    } else {
      // If hidden, show it
      existingOverlay.style.transform = "translateX(0)";
      console.log("Fireproof overlay shown");
    }
  } else {
    // If the overlay doesn't exist, create and inject it
    const jsFiles = [
      "/assets/__vite-browser-external-Dq6FBzox.js",
      "/assets/gateway-IZRHJWPE-BxrYi0sr.js",
      "/assets/index-B0W44gDG.js",
      "/assets/index-CZTnwKAA.js",
      "/assets/key-bag-indexdb-NFNGAXN7-D5PzO3Ag.js",
    ];
    const css = chrome.runtime.getURL("/assets/index-BpOJRVZN.css");
    console.log(jsFiles, css);

    const overlayContainer = document.createElement("div");
    overlayContainer.id = overlayId;
    document.body.appendChild(overlayContainer);

    const shadowRoot = overlayContainer.attachShadow({ mode: "open" });

    const overlayHTML = `
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
          padding: 20px;
          transform: translateX(100%);
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
          padding: 20px;
        }
      </style>
      <div id="overlay-content">
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

    const linkTag = document.createElement("link");
    linkTag.setAttribute("rel", "stylesheet");
    linkTag.setAttribute("href", css);

    shadowRoot.appendChild(linkTag);

    const closeButton = shadowRoot.getElementById("close-fireproof-overlay");
    closeButton.addEventListener("click", () => {
      overlayContainer.style.transform = "translateX(100%)";
    });

    // Animate the overlay sliding in
    setTimeout(() => {
      overlayContainer.style.transform = "translateX(0)";
    }, 0);

    console.log("Fireproof overlay injected and shown");
  }
})();
