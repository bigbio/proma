function showAnnotator() {
    var html = HtmlService.createHtmlOutputFromFile('Annotator-Template')
      .setTitle('PROMA - Ontology Search & Tagging')
      .setWidth(300);
  
    SpreadsheetApp.getUi()
      .showSidebar(html);
}

function runAnnotator() {
  return performAnnotation();
}

function performAnnotation() {
    try {
        var sheet = SpreadsheetApp.getActiveSheet();
        var selectedRange = SpreadsheetApp.getActiveRange();
        
        var restriction = findRestrictionForCurrentColumn("OLS");
      
        var valuesToSend = {};                                                                                               
        for (var rowIndex = selectedRange.getRow(); rowIndex <= selectedRange.getLastRow(); rowIndex++) {
            for (var columnIndex = selectedRange.getColumn(); columnIndex <= selectedRange.getLastColumn(); columnIndex++) {
                var value = sheet.getRange(rowIndex, columnIndex).getValue();
                if (valuesToSend[value] == undefined) {
                    valuesToSend[value] = new Object();
                }                                                                                                            
            }
        }

        var valuesToTag = "";
        for (var valueToTag in valuesToSend) {

            valuesToTag += valueToTag + " ";                                                                                 
            valuesToSend[valueToTag].from = valuesToTag.indexOf(valueToTag);
            valuesToSend[valueToTag].to = valuesToSend[valueToTag].from + valueToTag.length;                                 
        
 
            var url = 'http://www.ebi.ac.uk/ols/api/search';
           
            var queryObj =
            {
                q: valueToTag,
                rows: OLS_PAGINATION_SIZE,
                start: 0,
                ontology: restriction ? restriction.ontologyId : undefined,
                exact: true
            };
            var queryString = jsonToQueryString(queryObj);                                   
            url += '?' + queryString;                                                        

            var result = UrlFetchApp.fetch(url).getContentText();

            var ontologies = getOLSOntologies();

            var json = JSON.parse(result), ontologyDict = {};
            var docs = json.response && json.response.docs;                                  
            if (!docs || docs.length === 0) {
            throw "No Result found.";
            }
            var valueToAnnotatorResult = valuesToSend[valueToTag];
                
                if (valueToAnnotatorResult.results == undefined) {
                    valueToAnnotatorResult.results = {};
                }
            docs.forEach(function(elem) {
              
                var ontologyAbbreviation = elem.ontology_prefix;
                
                
                if (valueToAnnotatorResult.results[ontologyAbbreviation] == undefined) {
                    valueToAnnotatorResult.results[ontologyAbbreviation] = {"ontology-name": elem.ontology_name, "terms": []};
                }
                var record;
                record = {
                        label: elem.label,
                        id: elem.id,
                        'ontology-label': elem.ontology_prefix,
                        'ontology-name': elem.ontology_name,
                        'ontology-obo_id': elem.obo_id,
                        accession: elem.iri,
                        ontology: elem.ontology_name,
                        details: '',
                        url: elem.iri,
                        "freeText": valueToTag
                        };
      
                storeInCache(record.id, JSON.stringify(record)); 
                valueToAnnotatorResult.results[ontologyAbbreviation].terms.push(record);   
            });   
              
            
            
        }
        
        storeInCache(url, JSON.stringify(valuesToSend));
        return valuesToSend;
        
    }
    catch (e) {
        Logger.log(e);
        throw e;
    }
}

function replaceTermWithSelectedValue(term_id) {

    var term = JSON.parse(fetchFromCache(term_id));
    var ontologyObject = {
        "term": term["label"],
        "accession": term_id,
        "ontologyId": term["ontology-label"],
        "ontologyVersion": term["ontology"],
        "ontologyDescription": term["ontology-name"],
        "url": term.url,
        "obo_id": term["ontology-obo_id"],
        "freeText": term.label
    }

    insertTermInformationInTermSheet(ontologyObject);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = sheet.getActiveSelection();


    var sourceAndAccessionPositions = getSourceAndAccessionPositionsForTerm(selectedRange.getColumn());

    for (var row = selectedRange.getRow(); row <= selectedRange.getLastRow(); row++) {

        for (var col = selectedRange.getColumn(); col <= selectedRange.getLastColumn(); col++) {
            if (sheet.getRange(row, col).getValue().toLowerCase() == ontologyObject.freeText.toLowerCase()) {
                if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
                    insertOntologySourceInformationInInvestigationBlock(ontologyObject);
                    sheet.getRange(row, selectedRange.getColumn()).setValue(ontologyObject.term);
                    sheet.getRange(row, sourceAndAccessionPositions.sourceRef).setValue(ontologyObject.ontologyId);
                    sheet.getRange(row, sourceAndAccessionPositions.accession).setValue(ontologyObject.accession);
                } 
                else {
                    var isDefaultInsertionMechanism = loadPreferences();
                    var selectedColumn = selectedRange.getColumn();
                    var nextColumn = selectedColumn +1;
                
                    if(!isDefaultInsertionMechanism) {
                      sheet.getRange(row, selectedColumn).setValue(ontologyObject.term);
                      sheet.getRange(row, nextColumn).setValue(ontologyObject.url);
                    } 
                    else {
                      sheet.getRange(row, selectedColumn).setFormula('=HYPERLINK("'+  ontologyObject.accession +'","' + ontologyObject.term + '")')
                    }
                }
            }
            
        }
    }
}
