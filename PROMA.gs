function onOpen() {
  SpreadsheetApp.getUi() 
      .createMenu('PROMA')
      .addItem('Ontology Search', 'showOntologySearch')
      .addItem('Ontology Annotator', 'showAnnotator')
      .addSeparator()
      .addItem('PROMA','showPROMA')
      .addSeparator()
      .addItem('Settings', 'showSettings')
      .addItem('About', 'showAbout')
      .addToUi();
}
