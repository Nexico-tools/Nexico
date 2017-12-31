##  Chrome extension for scraping and analyzing textual data

### Compiling and installing

1. `github clone https://github.com/Nexico-tools/Nexico.git` and `npm install` to install all the dependencies.
2. After that, on Mac run `ng build` on Linux run  `npm run build` and it will generate the dist folder with the build file.
3. copy background.js and manifest.js from src/assets/ to dist.
4. in Chrome, go to chrome://extensions/ click on "Load unpacked extension..." and choose the dist folder.
5. click on the N that appears next to the address bar..

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
