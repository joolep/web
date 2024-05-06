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



document.getElementById('upload-status').style.display = "none"
document.getElementById('close-delete-modal-button').addEventListener('click', () => {
    document.getElementById('delete-modal').style.display = 'none';
});


document.getElementById('upload-locations-button').addEventListener('click', function() {
    document.getElementById('file-input').click(); // Trigger file input click
});

document.getElementById('file-input').addEventListener('change', function(event) {
    if (this.files.length > 0) {
        const file = this.files[0];
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            readAndUpload(file);
        } else {
            document.getElementById('upload-status').style.display = 'flex'
            document.getElementById('upload-status').textContent = 'Please select a valid Excel file.';
        }
    }
});

function readAndUpload(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        uploadDataToFirestore(json);
        document.getElementById('upload-status').style.display = 'flex'
        document.getElementById('upload-status').textContent = 'Upload in progress...';
    };

    reader.onerror = function() {
        document.getElementById('upload-status').style.display = 'flex'
        document.getElementById('upload-status').textContent = 'Failed to read file.';
    };

    reader.readAsArrayBuffer(file);
}

function uploadDataToFirestore(data) {
    const batch = database.batch(); // Use a batch if multiple writes needed
    data.forEach((row, index) => {
        const locationId = generateRandomId(12);
        const locationData = await geocodeAddress(row.Address);

        const location = {
          id : locationId,
          name: row.Name || '',
          cuisineCategory: row.CusineSpecialtyID ? [row.CusineSpecialtyID] : [],
          additionalOfferings: row.AdditionalOfferingsID ? row.AdditionalOfferingsID.split(',').map(s => s.trim()) : [],
          websiteURL: row.Website || '',
          michelinRating: row.MichelinDistinction || '',
          phoneNumber: row.PhoneNumber || '',
          description: row.Description || '',
          image: row.ImageUrl || '',
          locationType: row.BusinessType ? [row.BusinessType] : [],
          location: locationData,
          menuURL: '',
          hours: parseLocationHours(row.Hours),
          comments: [],
          features: [],
          photos: [],
          price: row.Price,
          reservationsURL: '',
          specials: [],
          timesAvailable: [],
          musicGenre: [],
          profilePhoto: '',
          promotionExpirationDate: new Date()
        };
        
        
        const docRef = database.collection('locations').doc(locationId);
        batch.set(docRef, location);
    });

    batch.commit()
        .then(() => {
            document.getElementById('upload-status').style.display = 'flex'
            document.getElementById('upload-status').textContent = 'Upload successful!';
        })
        .catch(error => {
            console.error('Error uploading data:', error);
            document.getElementById('upload-status').style.display = 'flex'
            document.getElementById('upload-status').textContent = 'Upload failed!';
        });
}


function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function parseLocationHours(hoursString) {
    if (!hoursString) return [];

    return hoursString.split(',').map(part => {
        const details = part.trim().split('|');
        if (details.length === 3) {
            const days = details[0].split('-');
            if (days.length === 2) {
                return {
                    startDay: days[0].trim(),
                    endDay: days[1].trim(),
                    openTime: parseInt(details[1].trim()),
                    closeTime: parseInt(details[2].trim())
                };
            }
        }
        return null;
    }).filter(Boolean); // Remove any null entries if parsing fails
}



async function geocodeAddress(address) {
    const apiKey = 'AIzaSyBhgi8CEmayQBeftVcs0PmWo3n7d7TfQiU';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const { lat, lng } = response.data.results[0].geometry.location;
            const components = response.data.results[0].address_components;
            const locationObject = {
                address: address,
                city: findComponent('locality', components),
                country: findComponent('country', components),
                geohash: '', // Geohash needs to be computed based on lat, lng
                lat: lat,
                lng: lng,
                state: findComponent('administrative_area_level_1', components),
                zipCode: findComponent('postal_code', components)
            };
            locationObject.geohash = Geohash.encode(lat, lng);
            return locationObject;
        } else {
            throw new Error('Geocoding failed with status: ' + response.data.status);
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

function findComponent(type, components) {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.long_name : '';
}
