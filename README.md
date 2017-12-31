##  Chrome extension for scraping and analyzing textual data

### Compiling and installing

1. `github clone https://github.com/Nexico-tools/Nexico.git` and `npm install` to install all the dependencies.
2. After that, on Mac run `ng build` on Linux run  `npm run build` and it will generate the dist folder with the build file.
3. copy background.js and manifest.js from src/assets/ to dist.
4. in Chrome, go to chrome://extensions/ click on "Load unpacked extension..." and choose the dist folder.
5. click on the N that appears next to the address bar..

### Update extension while coding

1. `npm run build ; cp src/assets/manifest.json dist/ ; cp src/assets/background.js dist/` to build and copy necessary files
2. refresh the extension (no need to reload the directory)


### Usage

#### text file analysis

1. put text files in a folder
2. click on **+ from Folder**
3. choose the folder
4. give a name to your database

You can now click on the squares to see the content and the specific vocabulary of each file. Specificity is computed with Fisher's exact test (cummulative hypergeometric function).

#### Web file analysis

not fully functional yet.

1. click on **+ from Web**
2. provide a URL
3. click **follow links of domain**
4. give a name to your database

### Source code quick review

- `src/app`: main component
    - app.component.html -> html file containing the main interface
    - app.component.ts -> typescript file for the main interface (all actions : trigger dialog, table actions, trigger export, etc.)
- `src/app/config`
    - javascript files for stats computing
- `src/app/dbnamedialog` : database manager component
    - dbnamedialog.component.html -> html file for the database dialog
    - dbnamedialog.component.ts -> ts file to handle clicks on the dialog
- `src/app/fusiondialog` : component for fusioning databases
- `src/app/wizardone` : component for the crawler dialog (from url/multiple urls ; regex or links)
- `src/app/wizardtwo` : component for the progress bar
- `src/dbstructure.ts` : classe/objects to hold database structures
- `src/pouchdb.service.ts` : service class to interact with the database from localstorage (pouchdb) : put, fetch, get, etc.
- `src/assets` : resources folder
- `src/environment.ts` : set the environment type (production, or not)
- `src/index.html` : app root (will use the background.js in a chrome extension)
- `rc/package.json` : package info and dependencies 
