function fetchLocations() {
    const locationsRef = database.collection('locations');
    return locationsRef.get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No locations found.');
                return;
            }
            snapshot.forEach(doc => {
                const locationData = doc.data();
                renderLocations(locationData);

            });
        })
        .catch(error => {
            console.error("Error fetching locations: ", error);
        });
}

function renderLocations(location) {
    const locationsTable = document.getElementById('locations-table');
    const locationRow = createDOMElement('div', 'row-parent', '', locationsTable);

    let locationName = createDOMElement('div', 'row-div-20', '', locationRow);
    createDOMElement('div', 'row-text', location.name, locationName);

    createDOMElement('div', 'row-div-15 row-text', location.locationType[0], rowParent);
    createDOMElement('div', 'row-div-30 row-text', location.location.address, rowParent);

    let websiteContainer = createDOMElement('div', 'row-div-20', '', locationRow);
    let linkIcon = createDOMElement('div', 'website-link', '', websiteContainer);
    linkIcon.addEventListener('click', () => {
        window.open(location.website)
    })
    
    let actionsContainer = createDOMElement('div', 'row-div-20', '', locationRow);
    let deleteButton = createDOMElement('div', 'delete-location-button', '', actionsContainer);
    linkIcon.addEventListener('click', () => {
        
    })

}



