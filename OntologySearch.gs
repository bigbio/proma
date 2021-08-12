// OntoMaton is a component of the ISA software suite (http://www.isa-tools.org)
//
// License:
// OntoMaton is licensed under the Common Public Attribution License version 1.0 (CPAL)
//
// EXHIBIT A. CPAL version 1.0
// “The contents of this file are subject to the CPAL version 1.0 (the “License”);
// you may not use this file except in compliance with the License. You may obtain a
// copy of the License at http://isatab.sf.net/licenses/OntoMaton-license.html.
// The License is based on the Mozilla Public License version 1.1 but Sections
// 14 and 15 have been added to cover use of software over a computer network and
// provide for limited attribution for the Original Developer. In addition, Exhibit
// A has been modified to be consistent with Exhibit B.
//
// Software distributed under the License is distributed on an “AS IS” basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
// the specific language governing rights and limitations under the License.
//
// The Original Code is OntoMaton.
// The Original Developer is the Initial Developer. The Initial Developer of the
// Original Code is the ISA Team (Eamonn Maguire, eamonnmag@gmail.com;
// Philippe Rocca-Serra, proccaserra@gmail.com; Susanna-Assunta Sansone, sa.sanson@gmail.com; Alejandra Gonzalez-Beltran, alejandra.gonzalez.beltran@gmail.com
// http://www.isa-tools.org). All portions of the code written by the ISA Team are
// Copyright (c) 2007-2020 ISA Team. All Rights Reserved.
//
// EXHIBIT B. Attribution Information
// Attribution Copyright Notice: Copyright (c) 2007-2020 ISA Team
// Attribution Phrase: Developed by the ISA Team
// Attribution URL: http://www.isa-tools.org
// Graphic Image provided in the Covered Code as file: http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png
// Display of Attribution Information is required in Larger Works which are defined in the CPAL as a work which combines Covered Code or portions thereof with code not governed by the terms of the CPAL.

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
