# Nexico
Nexico javascript code for scraping and analyzing textual data



The statistical computation object Stat can be used as follows:
Object creation: Stat([textSect1, textSect2, textSect3, ...], specLevel)

The text of each section is provided in the creation process of the object (text in utf-8).
Other parameter: the specificity level from the user options (5 by default)

The Stat object takes care of the tokenization of the texts and provides the following elements:
* Int Stat.nbtypes: total number of types (different words)
* Int Stat.nbtokens: total number of tokens (word count)
* Function Stat.freqtotal(token) ->  freqtotal: gives the total frequency of the token (frequency in all sections combined)
* Function Stat.sections(sectionNumber) -> text of the section
* Function Stat.sectionsize(sectionNumber) -> sectionSize: gives the total nb of tokens in section
* Function Stat.sectiontokens(sectionNumber) -> Array of tokens of the section
* Function Stat.sectiontypes(sectionNumber) -> Array of types (different tokens) of the section
* Function Stat.sectokfreq(sectionNumber, tok) -> freqOfTokenInSection
* Function Stat.selection(arrayOfSectionNumbers) -> the combined texts of the selected sections
* Function Stat.selectionsize(arrayOfSectionNumbers) -> nb of tokens of the sections in the selections combined
* Function Stat.selectiontypes(sectionNumber) -> Array of types (different tokens) of the section
* Function Stat.selectionSpec(arrayOfSectionNumbers, tok) -> (freqInSel, totalFreqOfTok, specInSel        )
* A selection is an array of section numbers (corresponding to the squares that the user has selected on the section map)
* This function gives back a triple that contains the table to show:
  1. freqInSel : the frequency of the token in the selection
  2. totalFreqOfTok : the total frequency of the token in the whole corpus (repeted from Stat.sections(sectionNumber) for easy filling of specificity table)
  3. specInSel : the specificity of the token in the selection (complex computation)
