# Prepare Territories in Google My Maps

Step-by-step help for preparing JW congregation territories using Google My Maps.

## Overview

The goal is to create a single master map in Google My Maps, split it into separate CSV files for each territory, import each territory back into Google My Maps as its own map, and collect shareable links to those maps.

## What you need

- A Google account
- One or more congregation territory files from Google My Maps
- The `csv-splitter.js` Google Apps Script included in this repository

## Step 1 – Create a master map in Google My Maps

1. Open [Google My Maps](https://www.google.com/mymaps).
2. Create a new map.
3. Add your territories as layers. For best results, each layer should have `name` and `description` fields.
4. Make sure each layer contains a geometry column (usually exported as `WKT`) and the `name` and `description` columns.

## Step 2 – Export each layer to CSV and upload it to Google Drive

1. In Google My Maps, open the layer menu for a layer.
2. Choose **Export to CSV**.
3. Save the CSV file.
4. Upload the exported CSV files to a single Google Drive folder. Copy that folder's ID for the next step.

> **Tip:** Keep all the exported CSV files in one folder. The script will process every CSV it finds in that folder.

## Step 3 – Run the `csv-splitter.js` script

1. Go to [Google Apps Script](https://script.google.com).
2. Create a new project.
3. Replace the default code with the contents of `csv-splitter.js`.
4. In line 3, replace `YOUR_SOURCE_FOLDER_ID_HERE` with the Google Drive folder ID from Step 2.
5. Save the project.
6. Run the `splitAllCsvFilesInFolder` function.
7. Authorize the script when prompted so it can read and create files in your Google Drive.

### What the script does

- Reads every CSV file in the source folder.
- Splits each row into a separate CSV file named after its `name` value.
- Places all the generated CSV files in a sub-folder called `Split Maps Output` inside the source folder.

## Step 4 – Import each split CSV back into Google My Maps

1. Open [Google My Maps](https://www.google.com/mymaps).
2. Create a new map for each territory.
3. In the new map, choose **Import** and select one of the CSV files from the `Split Maps Output` folder.
4. Repeat for each split CSV file.

## Step 5 – Get and share the map links

1. Open each territory map in Google My Maps.
2. Click **Share** and copy the link.
3. **Important:** In the copied link, replace `/edit` with `/viewer` before sending it out.
   - Links ending in `/edit` allow others to change the map.
   - Links ending in `/viewer` only let people view the map, which is usually what you want when sharing congregation territories.
4. Save the viewer links in a list — these links are the final goal of the workflow.

## Result

You now have a collection of individual Google My Maps links, one per territory, that can be shared with publishers without giving them editing rights.
