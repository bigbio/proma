function onOpen() {
  SpreadsheetApp.getUi() 
      .createMenu('OntoMaton')
      .addItem('Ontology Search', 'showOntologySearch')
      .addItem('Ontology Annotator', 'showAnnotator')
      .addSeparator()
      .addItem('SDRF Annotate','showSDRFAnnotate')
      .addSeparator()
      .addItem('Settings', 'showSettings')
      .addItem('About', 'showAbout')
      .addToUi();
}