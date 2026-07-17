function splitAllCsvFilesInFolder() {
  // 1. Paste your main Google Drive Folder ID between the quotes below
  var SOURCE_FOLDER_ID = "YOUR_SOURCE_FOLDER_ID_HERE"; 
  var SUB_FOLDER_NAME = "Split Maps Output";
  
  var sourceFolder;
  try {
    sourceFolder = DriveApp.getFolderById(SOURCE_FOLDER_ID);
  } catch(e) {
    Logger.log("❌ ERROR: Invalid Folder ID. Please check the ID string at the top of the script.");
    return;
  }
  
  // 2. Find or create the sub-folder for outputs
  var subFolder;
  var subFolderIterator = sourceFolder.getFoldersByName(SUB_FOLDER_NAME);
  if (subFolderIterator.hasNext()) {
    subFolder = subFolderIterator.next();
  } else {
    subFolder = sourceFolder.createFolder(SUB_FOLDER_NAME);
  }
  
  // 3. Iterate explicitly through .csv files in the source folder
  var files = sourceFolder.getFilesByType(MimeType.CSV);
  var filesProcessed = 0;
  var csvCreatedOrUpdated = 0;
  
  Logger.log("Searching folder for raw CSV files...");
  
  while (files.hasNext()) {
    var file = files.next();
    Logger.log("📄 Found CSV file: " + file.getName());
    
    // Read the text data out of the CSV file blob safely
    var fileDataString = file.getBlob().getDataAsString();
    var data;
    
    try {
      data = Utilities.parseCsv(fileDataString);
    } catch(err) {
      Logger.log("⚠️ Could not parse data inside " + file.getName() + " as standard CSV. Skipping.");
      continue;
    }
    
    if (data.length <= 1) {
      Logger.log("ℹ️ '" + file.getName() + "' is empty or contains no rows. Skipping.");
      continue;
    }
    
    // Normalize header formatting to check for key variables
    var headers = data[0].map(function(h) { return h.toString().trim(); });
    
    // Find column positions dynamically
    var wktIdx = headers.indexOf("WKT");
    var nameIdx = headers.indexOf("name");
    var descIdx = headers.indexOf("description");
    
    if (wktIdx == -1 || nameIdx == -1 || descIdx == -1) {
      Logger.log("⚠️ Skipping '" + file.getName() + "' - Missing exact headers (WKT, name, description). Found instead: " + headers.join(", "));
      continue;
    }
    
    filesProcessed++;
    
    // 4. Process each data row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Safety check to ensure the row actually has fields mapped
      if (row.length <= nameIdx) continue;
      
      var fileNameStr = row[nameIdx].toString().trim();
      
      // Skip row if the destination name cell is blank
      if (!fileNameStr) continue;
      
      var wktVal = row[wktIdx] || "";
      var descVal = row[descIdx] || "";
      
      // Format row as a safe, cleanly escaped CSV string
      var csvContent = "WKT,name,description\n" + 
                       escapeCSV(wktVal) + "," + 
                       escapeCSV(fileNameStr) + "," + 
                       escapeCSV(descVal);
      
      var fullFileName = fileNameStr + ".csv";
      
      // 5. Check if the CSV already exists in the sub-folder
      var existingFiles = subFolder.getFilesByName(fullFileName);
      if (existingFiles.hasNext()) {
        // File exists -> Overwrite content with fresh state
        var existingFile = existingFiles.next();
        existingFile.setContent(csvContent);
      } else {
        // File does not exist -> Create brand new CSV
        subFolder.createFile(fullFileName, csvContent, MimeType.PLAIN_TEXT);
      }
      csvCreatedOrUpdated++;
    }
  }
  
  // 6. Print final summary details directly to the execution log
  Logger.log("==========================================================");
  Logger.log("📊 FINAL SUMMARY:");
  Logger.log("Processed " + filesProcessed + " source CSV file(s).");
  Logger.log("Generated/Updated " + csvCreatedOrUpdated + " individual item CSV files inside the '" + SUB_FOLDER_NAME + "' folder.");
  Logger.log("==========================================================");
}

// Helper function to cleanly wrap text containing commas or quotes for CSV safety
function escapeCSV(value) {
  var str = String(value);
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}