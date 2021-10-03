function showOntologySearch() {
    var html = HtmlService.createHtmlOutputFromFile('Ontology-Search-Template')
      .setTitle('PROMA - Ontology Search & Tagging')
      .setWidth(300);

    SpreadsheetApp.getUi()
      .showSidebar(html);
}

function runSearch(term) {
  return searchOLS(term);
}

/**
 * @method
 * @name searchOLS
 * @param{string} term
 */
function searchOLS(term) {
  try {
    var restriction = findRestrictionForCurrentColumn("OLS");
    var ontologies = getOLSOntologies();
    var url = OLS_API_BASE_URI + '/search';
    var queryObj = {
      q: term,
      rows: OLS_PAGINATION_SIZE,
      start: 0,
      ontology: restriction ? restriction.ontologyId : undefined
    };
    var queryString = jsonToQueryString(queryObj);
    url += '?' + queryString;
    var cacheResult = fetchFromCache(url);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }
    var text = UrlFetchApp.fetch(url).getContentText(), json = JSON.parse(text), ontologyDict = {};

    var docs = json.response && json.response.docs;
    if (!docs || docs.length === 0) {
      throw "No Result found.";
    }
    docs.forEach(function(elem) {
      var ontology = ontologies[elem.ontology_name], ontologyLabel = elem.ontology_prefix, record;
      if (!ontologyDict[ontologyLabel]) {
        ontologyDict[ontologyLabel] = {"ontology-name": elem.ontology_name, "terms": []};
        record = {
          label: elem.label,
          id: elem.id,
          'ontology-label': elem.ontology_prefix,
          'ontology-name': elem.ontology_name,
          accession: elem.iri,//elem.obo_id,
          ontology: elem.ontology_name,
          details: '',
          url: elem.iri
        };

        storeInCache(record.id, JSON.stringify(record));
        ontologyDict[ontologyLabel].terms.push(record);
      }
    });
    storeInCache(url, JSON.stringify(ontologyDict));
    // Logger.log(ontologyDict);
    return ontologyDict;
  }
  catch(e) {
    Logger.log(e);
    throw(e);
  }
}

function handleTermInsertion(term_id) {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = sheet.getActiveSelection();
    var textTerm = fetchFromCache(term_id);
    var term = JSON.parse(textTerm);

    var ontologyObject = {
        "term": term["label"],
        "accession": term_id,
        "ontologyId": term["ontology-label"],
        "ontologyVersion": term["ontology"],
        "ontologyDescription": term["ontology-name"],
        "url": term["url"]
    }

    // figure out whether the Term Source REF and Term Accession Number columns exist, if they do exist at all. Insertion technique will vary
    // depending on the file being looked at.
    var sourceAndAccessionPositions = getSourceAndAccessionPositionsForTerm(selectedRange.getColumn());
    
    // add all terms into a separate sheet with all their information.
    if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
        insertOntologySourceInformationInInvestigationBlock(ontologyObject);
    }

    for (var row = selectedRange.getRow(); row <= selectedRange.getLastRow(); row++) {

        // if the currently selected column is an ISA defined ontology term, then we should insert the source and accession in subsequent
        // columns and add the ontology source information to the investigation file if it doesn't already exist.
        if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
            sheet.getRange(row, selectedRange.getColumn()).setValue(ontologyObject.term);
            sheet.getRange(row, sourceAndAccessionPositions.sourceRef).setValue(ontologyObject.ontologyId);
            sheet.getRange(row, sourceAndAccessionPositions.accession).setValue(ontologyObject.url);
        } else {

            var isDefaultInsertionMechanism = loadPreferences();
            var selectedColumn = selectedRange.getColumn();
            var nextColumn = selectedColumn + 1;

            if (!isDefaultInsertionMechanism) {
                sheet.getRange(row, selectedColumn).setValue(ontologyObject.term);
                sheet.getRange(row, nextColumn).setValue(ontologyObject.url);
            } else {
                sheet.getRange(row, selectedColumn).setFormula('=HYPERLINK("' + ontologyObject.url + '","' + ontologyObject.term + '")')
            }
        }
    }
    insertTermInformationInTermSheet(ontologyObject);
  }
  catch(err) {
    Logger.log(err);
    throw err;
  }

}
