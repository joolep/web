

//Disable webflow form
$('#search-form').submit(function() {
    return false;
});

//Algolia
const searchClient = algoliasearch('F92ZCD7DSZ', 'ecda5dd26881da1726b01e829ab3edd9');

const headerSearch = instantsearch({
    indexName: 'joolep_locations',
    searchClient
});

function createAutocompleteResults(results) {

    let hitsContainer = document.createElement('div')
    hitsContainer.className = 'header-autocomplete-results'

    if(results.hits.length != 0) {
        for (i = 0; i < results.hits.length; i++) {

            var hit = results.hits[i]
    
            hitsContainer.appendChild( renderLocationResult(hit))
        }
    } else {
        headerAutocompleteResults.style.display = 'none'
    }

    return hitsContainer.outerHTML
}
// Create the render function
const headerRenderAutocomplete = (renderOptions, isFirstRender) => {
  const { indices, currentRefinement, refine, widgetParams } = renderOptions;

  if (isFirstRender) {
    const input = document.querySelector('#locations-search-field');

    input.addEventListener('input', event => {
        refine(event.currentTarget.value);

        if(event.currentTarget.value == '') {
            fetchLocations(1, 100); // Each page fetches 100 items
            setupPagination(1); //Fetches locations
        }
    });
  }

  document.querySelector('#locations-search-field').value = currentRefinement;
  widgetParams.container.innerHTML = indices
    .map(createAutocompleteResults)
    .join('');
};

// Create the custom widget
const headerCustomAutocomplete = instantsearch.connectors.connectAutocomplete(
    headerRenderAutocomplete
);

// Instantiate the custom widget
headerSearch.addWidgets([
    
    headerCustomAutocomplete({
    container: document.querySelector('#locations-table'),
  })
  
]);

headerSearch.start()



function renderLocationResult(location) {

    const locationRow = document.createElement('div');
    locationRow.className = 'row-parent';

    let locationName = createDOMElement('div', 'row-div-20', '', locationRow);
    createDOMElement('div', 'row-text', location.name, locationName);

    createDOMElement('div', 'row-div-15 row-text', location.locationType[0], locationRow);
    createDOMElement('div', 'row-div-30 row-text', location.location.address, locationRow);

    let websiteContainer = createDOMElement('div', 'row-div-15', '', locationRow);
    if (location.website) {
        let linkIcon = createDOMElement('div', 'website-link', '', websiteContainer);
        linkIcon.addEventListener('click', () => {
            window.open(location.website)
        })
    } else {
        createDOMElement('div', 'row-div-15', 'None', websiteContainer);
    }
    
    let actionsContainer = createDOMElement('div', 'row-div-20', '', locationRow);
    let deleteButton = createDOMElement('div', 'delete-location-button', '', actionsContainer);
    
    return locationRow
}

