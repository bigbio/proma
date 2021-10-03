function showAbout() {

    var html = HtmlService.createHtmlOutputFromFile('About-Template')
      .setTitle('PROMA - Ontology Search & Tagging')
      .setWidth(300);
  
    SpreadsheetApp.getUi()
      .showSidebar(html);
  
}


