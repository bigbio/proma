<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/logo_with_name.png" width="100">
</div>

<br/>
<strong>PROMA</strong> is a proteome metadata annotator based on the <a href="https://github.com/ISA-tools/OntoMaton">OntoMaton</a> tool. We have retained the original functionality of OntoMaton and added the ability to retrieve ontology and annotate the <a href="https://github.com/bigbio/proteomics-metadata-standard/tree/master/sdrf-proteomics">SDRF-Proteomics</a> in Google Spreadsheet.

<br/>

### Function Introduction
PROMA is powered by the <a href="https://www.ebi.ac.uk/ols/index">EBI Ontology Lookup Service</a>, which greatly improves the efficiency of completing SDRF-Proteomics files.

The current version of PROMA has the following features:

- <b>Insert a template: </b>we provide [6 templates](https://github.com/bigbio/proteomics-metadata-standard/tree/master/templates) according to species classification, including cell-line, default, human, nonvertebrates, plants, and vertebrates. Note that each application of the template overwrites the first line of the current sheet.
- <b>Insert related parameters: </b>we organised the searched ontology information into the form of key-value pairs, with four parameters in total: modification parameters, instrument, cleavage agent details and label.
- <b>Record: </b>add a sheet named Record to record the parameter information searched and inserted.

<br/>

### Installation

To try PROMA, you need to add the extension to your Google spreadsheet. The following steps will make it easy.

1. Click on the 'Add-ons' menu item in your Google Spreadsheet:

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_1.png" width="600">
</div>
<br/>

2. Click on 'Get add-ons...' and then search for 'Proma':

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_2.png" width="600">
</div>
<br/>

You should get the following result:

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_3.png" width="600">
</div>
<br/>

Here you can click on the image and read more about Proma:

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_4.png" width="600">
</div>
<br/>

3. To install, click on '+FREE'. You will need to authorise Proma Add-on to access your spreadsheets and to connect to external services:

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_5.png" width="600">
</div>
<br/>

4. You'll then have the OntoMaton app installed.

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_6.png" width="600">
</div>
<br/>

You can access it through the 'Add On' menu option.

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_7.png" width="600">
</div>
<br/>

### Select Template

If the properties of the first row have been correctly filled in, skip this step.

Select a template and click the "Apply" button. You should get the following results:

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_8.png" width="1000">
</div>
<br/>

### SDRF Annotation

We searched Ontology information through [EBI Ontology Lookup Service](https://www.ebi.ac.uk/ols/), and sorted the label and obo_id in the returned information into the form of key-value pairs.When searching for modification parameters, we recommend modifying all parameters. To search for other types, just type NT or AC.

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_9.png" width="700">
</div>
<br/>

Click on the cell to specify the range, click on the "Insert" button in the search results, and you'll get something like this:

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_10.png" width="800">
</div>
<br/>

### Record

<div align="center">
<img src="https://github.com/bigbio/proma/blob/main/figures/figure_readme_11.png" width="600">
</div>
<br/>

When you insert, a 'Record' sheet will be added automatically. This sheet will have the following column headers:
```Parameter Type | Parameter Value | Term Name | Ontology Source | Term URI```. This is how we record your inserts.

An example of a google spreadsheet with such functionality can be viewed here: https://docs.google.com/spreadsheets/d/1kg043sFW2-hkWD7u_0tT2KbG7d0HqftTkULo5kYvJrw/edit#gid=1973647948

 
### Video Tutorial

Access the video tutorial showing how to install and use PROMA [here](https://www.youtube.com/watch?v=wbX4iSb4H9M&list=PLQVvhMGFuG46d96tzZNsOSwwdzfJKpYZA).
 
### Templates

PROMA templates are [here](https://github.com/bigbio/proteomics-metadata-standard/tree/master/templates).

### Questions

If you have any queries, please email us at [link](). For bug reports, please [use the issue page here](https://github.com/bigbio/proma/issues).

### License






