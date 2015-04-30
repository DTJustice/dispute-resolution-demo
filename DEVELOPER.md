# Alternate dispute resolution — developer documentation

## Converting data from spreadsheet

1. Save the Excel sheet as HTML.
2. Grab just the HTML table in a separate file (remove all the Excel HTML code) 
3. Run the script 'import-neighbourhood-data.js' to generate JSON data
4. TODO: crawler to extract metadata

Longer term, the goal is to place the data in the [Queensland Government data portal](https://data.qld.gov.au) which will provide a JSON API.