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
            const locationsTable = document.getElementById('locations-table');

            snapshot.forEach(doc => {
                const locationData = doc.data();
                locationsTable.append(renderLocationResult(locationData))
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


function renderLocationResult(location) {

    const locationRow = document.createElement('div');
    locationRow.className = 'row-parent';
    locationRow.id = location.id

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
    deleteButton.addEventListener('click', () => {
        openDeleteModal(location);
    });
    
    return locationRow
}





function openDeleteModal(location) {
    // Populate the modal with location data
    document.getElementById('modal-location-name').textContent = location.name;
    document.getElementById('modal-location-address').textContent = location.location.address;
    document.getElementById('modal-location-type').textContent = location.locationType.join(", ");  // Assuming array of types

    // Show the modal
    document.getElementById('delete-modal').style.display = 'flex';

    // Set up confirm delete action
    document.getElementById('confirm-delete-location-button').onclick = () => {
        deleteLocation(location.id);
    };
}

function deleteLocation(locationId) {
    database.collection('locations').doc(locationId).delete().then(() => {
        console.log(`Location ${locationId} successfully deleted`);
        // Dismiss the modal
        document.getElementById('delete-modal').style.display = 'none';
        // Remove the div element from the table
        const elementToRemove = document.getElementById(locationId);
        if (elementToRemove) {
            elementToRemove.parentNode.removeChild(elementToRemove);
        }
    }).catch(error => {
        console.error('Error removing document: ', error);
    });
}
