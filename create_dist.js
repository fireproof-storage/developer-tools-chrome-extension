const fs = require("fs");
const path = require("path");

// Function to read the content of a file
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

// Function to write content to a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

// Function to copy a file
function copyFile(sourcePath, destinationPath) {
  fs.copyFileSync(sourcePath, destinationPath);
}

// Function to get the names of the asset files
function getAssetFileNames(assetsPath) {
  const files = fs.readdirSync(assetsPath);
  console.log(files);
  const jsFiles = files.filter((file) => file.endsWith(".js"));
  const cssFile = files.find(
    (file) => file.startsWith("index-") && file.endsWith(".css")
  );
  return { jsFiles, cssFile };
}

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to empty a directory except for specific files
function emptyDirectoryExcept(dirPath, exceptFiles) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (!exceptFiles.includes(file)) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

// Function to create a symlink
function createSymlink(target, path) {
  fs.symlinkSync(target, path, 'dir');
}

// Function to remove a symlink
function removeSymlink(path) {
  fs.unlinkSync(path);
}

// Main function to process files
function processFiles() {
  const currentDir = __dirname;
  const buildPath = path.join(currentDir, "_build");
  const assetsPath = path.join(currentDir, "assets");

  // Create symlink _build -> ../dashboard-react-router-dev/dist/assets
  createSymlink(path.join("..", "dashboard-react-router-dev", "dist", "assets"), buildPath);

  // Ensure assets directory exists
  ensureDirectoryExists(assetsPath);

  // Empty assets directory except for fp-logo.png
  emptyDirectoryExcept(assetsPath, ["fp-logo.png"]);

  // Copy assets from _build to current directory, skipping specific files
  fs.readdirSync(buildPath).forEach((file) => {
    if (file.startsWith("bundle-not-impl") || file.startsWith("node-filesystem")) {
      return; // Skip this file
    }
    const srcPath = path.join(buildPath, file);
    const destPath = path.join(assetsPath, file);
    if (fs.statSync(srcPath).isFile()) {
      copyFile(srcPath, destPath);
    }
  });

  const { jsFiles, cssFile } = getAssetFileNames(assetsPath);

  // Process manifest.json
  const manifestPath = path.join(currentDir, "manifest.json");
  let manifest = JSON.parse(readFile(manifestPath));
  manifest.web_accessible_resources[0].resources = [
    ...jsFiles.map((file) => `assets/${file}`),
    `assets/${cssFile}`,
  ];
  writeFile(
    path.join(currentDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  // Process content.js
  const contentPath = path.join(currentDir, "content.js");
  let content = readFile(contentPath);
  const jsFilesString = jsFiles
    .map((file) => `"/assets/${file}"`)
    .join(",\n      ");
  content = content.replace(
    /const jsFiles = \[[\s\S]*?\];/,
    `const jsFiles = [\n      ${jsFilesString}\n    ];`
  );
  content = content.replace(/index-(.*)\.css/g, cssFile);
  writeFile(path.join(currentDir, "content.js"), content);

  // Process background.js
  // const backgroundPath = path.join(currentDir, "background.js");
  // const backgroundContent = readFile(backgroundPath);
  // writeFile(path.join(currentDir, "background.js"), backgroundContent);

  // Remove the symlink
  removeSymlink(buildPath);

  console.log(
    "Files processed and copied from _build to the current folder successfully."
  );
}

// Run the process
processFiles();
