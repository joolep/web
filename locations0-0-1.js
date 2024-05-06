let lastVisibleDocument = null; // Track the last document from the previous fetch

function fetchLocations(page, limit) {
    let locationsRef = database.collection('locations').orderBy('name').limit(limit);

    if (page > 1 && lastVisibleDocument) {
        locationsRef = locationsRef.startAfter(lastVisibleDocument);
    }

    return locationsRef.get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No more locations found.');
                return;
            }
            snapshot.forEach(doc => {
                const locationData = doc.data();
                renderLocations(locationData);
            });
            lastVisibleDocument = snapshot.docs[snapshot.docs.length - 1]; // Update lastVisibleDocument
        })
        .catch(error => {
            console.error("Error fetching locations: ", error);
        });
}

function setupPagination(currentPage) {
    const container = document.getElementById('pagination-container');
    container.innerHTML = ''; // Clear existing pagination buttons
    locationsTable.innerHTML = ''
    
    // Calculate the range of pages to show
    const startPage = Math.max(1, currentPage - 2);
    const endPage = startPage + 4; // Show next 5 pages

    // Create page buttons dynamically
    for (let page = startPage; page <= endPage; page++) {
        const pageElement = document.createElement('span');
        pageElement.className = (page === currentPage) ? 'active-page-number' : 'pagination-number';
        pageElement.textContent = page;
        pageElement.onclick = () => {
            fetchLocations(page, 100); // Each page fetches 100 items
            setupPagination(page); // Update pagination with the new active page
        };
        container.appendChild(pageElement);
    }
}

function updateActivePageNumber(activePage, container) {
    const pageNumbers = container.querySelectorAll('.pagination-number');
    pageNumbers.forEach(pageNumber => {
        pageNumber.className = 'pagination-number';
    });
    pageNumbers[activePage - 1].className = 'active-page-number';
}


function renderLocations(location) {
    const locationsTable = document.getElementById('locations-table');

    const locationRow = createDOMElement('div', 'row-parent', '', locationsTable);

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

}

