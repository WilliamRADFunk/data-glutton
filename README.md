# data-glutton
Simple service to scrape website data from multiple places to create a rich, ontologically defined, store of linked data.

Contains front and back ends.

## Steps to run the application

### Backend

1. Open a console window, powershell, or terminal. Navigate to data-glutton/data-glutton-rest

2. Run `npm install`

3. Run `npm run start` and wait until you see a line containing the test: `Data Glutton Backend listening on port 3000!`

`Note:`

_As long as the backend process isn't exited, exiting or refreshing of the browser window won't lose any of the previously scraped entities._

_If the download of files process in interrupted on the frontend, it may not download the zip bundle to your download folder, but the backend process will still finish the process and the zip bundle can still be found within the assets folder of the frontend file structure when the process has naturally concluded._

### Frontend

1. Open a separate console window, powershell, or terminal. Navigate to data-glutton/data-glutton-ui

2. Run `npm install`

3. Run `npm run start`

4. Open a browser (preferably Chrome in incognito-mode)

5. Navigate to `http://localhost:4200/`

## How to use application

### Collect Data

Either click the play icon next to a major category under `Data Sources` on the `Dashboard` page, or click a major category and a play button next to a subsection in the section below `Data Sources` (ie. `Countries` or `Airports`).

Wait for the orange pellets to finish.

In the left section (`Entities Collected`), you will see the number of entities per category you've collected so far.

In the right section (`Export Options`), you can select specific entities you want to download and whether you want to include the ontology files in that download.

`Note:`

_Some sections scrape *ALOT* of entities. This can be a very time consuming process. Might be a good time to get a cup of coffee._

_The same can be said when downloading these entities to a zip bundle. There are millions of triples and this takes time. When in doubt, look at the console window that's running the backend process. You'll see a logged progression of whatever step it's on at that moment._

### Entities Page

On this page, you have the option to either view the entities you've collected by category, or via a simple search mode. The toggles to switch between each mode is in the upper-righthand corner of the `Entities` section.

### Ontology

On this page, you will find a crude json-prettified dump of the ontology files in jsonld format for reference.

### Sources

This page contains locations and descriptions of the sites where the data was retrieved and tools used to create this application.