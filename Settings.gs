function showSettings() {
    var html = HtmlService.createHtmlOutputFromFile('Settings-Template').setTitle('PROMA - Ontology Search & Tagging').setWidth(300);
    createSettingsTab();
    SpreadsheetApp.getUi().showSidebar(html);
}

function loadOntologies() { 
    return {
        'OLS': getOLSOntologies()
    }
}

function createSettingsTab() {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    if (settingsSheet == undefined) {
        var activeSheet = SpreadsheetApp.getActiveSheet();
        settingsSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Settings");
        settingsSheet.getRange("A1").setValue("insertTermInOneColumn");
        settingsSheet.getRange("B1").setValue(true);
        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(activeSheet);
    }
}

function viewRestrictionHandler() {
     var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

    if (restrictionSheet == undefined) {
        UiApp.getActiveApplication().getElementById("status").setText("Restriction sheet doesn't exist yet. Add a restriction and it will be created automatically.");
        return UiApp.getActiveApplication();
    } else {
        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(restrictionSheet);
    }
}

function loadPreferences() {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");

    if (settingsSheet != undefined) {
        var settingsValue = settingsSheet.getRange("B1").getValue();
        return settingsValue;
    }
    return true;
}

function addRestrictionHandler(params) {
  
    var ontology = params.ontology.trim();
    var columnName = params.columnName.trim();
    var service = params.service.trim();
    
    var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

    if (restrictionSheet == undefined) {
        var activeSheet = SpreadsheetApp.getActiveSheet();
        restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Restrictions");
        restrictionSheet.getRange("A1").setValue("Column Name");
        restrictionSheet.getRange("B1").setValue("Ontology");
        restrictionSheet.getRange("C1").setValue("Branch");
        restrictionSheet.getRange("D1").setValue("Version");
        restrictionSheet.getRange("E1").setValue("Ontology Name");
        restrictionSheet.getRange("F1").setValue("Service");

        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(activeSheet);
    }

  
    if(columnName !== "") {
        var nextBlankRow = findNextBlankRow(restrictionSheet);
        restrictionSheet.getRange(nextBlankRow, 1).setValue(columnName);
        restrictionSheet.getRange(nextBlankRow, 2).setValue(ontology.substring(0, ontology.indexOf(" - ")));
        restrictionSheet.getRange(nextBlankRow, 5).setValue(ontology.substring(ontology.indexOf(" - ") + 3));
        restrictionSheet.getRange(nextBlankRow, 6).setValue(service);
        return "Restriction for " + columnName + " Added"
  }
  
  return "Column name cannot be empty."
}

function setOntologyInsertionPreference(insertSingleColumn) {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    settingsSheet.getRange("B1").setValue(insertSingleColumn);
}


/**
 * @method
 * @name getOLSOntologies
 * @description gets all the ontologies from OLS
 * @return{Object}
 */
function getOLSOntologies() {
  var ontologiesUri = OLS_API_BASE_URI + "/ontologies?size=" + OLS_PAGINATION_SIZE;
  var  cache = CacheService.getPrivateCache(), res, text, json, ontologies = [];

  if (cache.get("ols") == null) {
    do {
      res = UrlFetchApp.fetch(ontologiesUri);
      text = res.getContentText('utf-8');
      json = JSON.parse(text);
      ontologies = ontologies.concat(json._embedded.ontologies);
      ontologiesUri = json._links && json._links.next && json._links.next.href;
    }
    while (ontologiesUri);
    // store into cache the result as plain text
    splitResultAndCache(cache, "ols", JSON.stringify(ontologies));
  } else {
    ontologies = JSON.parse(getCacheResultAndMerge(cache, "ols"));
  }

  var ontologyDict = {};
  ontologies.forEach(function(ontology) {
    var config = ontology.config || {};
    ontologyDict[ontology.ontologyId] = {
      name: config.title,
      uri: config.id
    };
  });
  return ontologyDict;
}

