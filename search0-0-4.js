

//Disable webflow form
$('#search-form').submit(function() {
    return false;
});

//Algolia
const searchClient = algoliasearch('F92ZCD7DSZ', 'ecda5dd26881da1726b01e829ab3edd9');

const locationsSearch = instantsearch({
    indexName: 'joolep_locations',
    searchClient
});


const renderSearchResults = (renderOptions, isFirstRender) => {
    const { indices, currentRefinement, refine, widgetParams } = renderOptions;

    if (isFirstRender) {
      const input = document.querySelector('#locations-search-field');

      input.addEventListener('input', event => {
          refine(event.currentTarget.value);
          if (event.currentTarget.value == '') {
              fetchLocations(1, 100);  // Assume this function fetches and populates locationsTable
              setupPagination(1);  // Assume this function sets up pagination
          } else {
              // Clear existing content when performing a search
              while (locationsTable.firstChild) {
                  locationsTable.removeChild(locationsTable.firstChild);
              }
          }
      });
    }

    document.querySelector('#locations-search-field').value = currentRefinement;
    // Directly append new results if not an empty search
    indices.forEach(index => {
        index.hits.forEach(hit => {
            locationsTable.appendChild(renderLocationResult(hit));
        });
    });
};

// Create the custom widget
const customSearchField = instantsearch.connectors.connectAutocomplete(
      renderSearchResults
);

// Instantiate the custom widget
locationsSearch.addWidgets([
        customSearchField({
        container: document.querySelector('#locations-table'),
    })
]);

headerSearch.start()
