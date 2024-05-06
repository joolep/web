
// The createDOMElement function as provided
function createDOMElement(type, className, value, parent) {
    let DOMElement = document.createElement(type);
    DOMElement.setAttribute('class', className);
    if (type == 'img') {
        DOMElement.src = value;
    } else {
        DOMElement.innerHTML = value;
    }
    parent.appendChild(DOMElement);
    return DOMElement
}


//Globals
let currentUserID = ""


//References
const adminLocations = document.getElementById('admin-locations')
const adminUsers = document.getElementById('admin-users')
const adminPromotions = document.getElementById('admin-promotions')

const locationsTable = document.getElementById('locations-table')
const usersTable = document.getElementById('users-table')
const promotionsTable = document.getElementById('promotions-table')

const locationsTab = document.getElementById('locations-tab')
const usersTab = document.getElementById('users-tab')
const promotionsTab = document.getElementById('promotions-tab')


document.addEventListener("DOMContentLoaded", function() {
    //Clear tables
    locationsTable.innerHTML = ""
    usersTable.innerHTML = ""
    promotionsTable.innerHTML = ""
    
    //Build Tables
    fetchUsers()
    fetchLocations(1, 100); // Each page fetches 100 items
    setupPagination(1); //Fetches locations
    fetchPromotions()
        
    //Set initial states
    adminLocations.style.display = 'block';
    adminUsers.style.display = 'none';
    adminPromotions.style.display = 'none';
    
    locationsTab.className = 'nav-item-selected';
    usersTab.className = 'nav-item';
    promotionsTab.className = 'nav-item';

    // Event listeners for tabs
    locationsTab.addEventListener('click', function() {
        showLocations();
    });

    usersTab.addEventListener('click', function() {
        showUsers()
    });
    
    promotionsTab.addEventListener('click', function() {
        showPromotions()
    });


    
    // Auth state changed event
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Update the global User ID
            currentUserID = user.uid;

        } else {
            console.log("No user is signed in.");
//            location.href = 'https://www.tutortree.com/login';
        }
    });
});


function showLocations() {
    adminLocations.style.display = 'block';
    adminUsers.style.display = 'none';
    adminPromotions.style.display = 'none';
    
    locationsTab.className = 'nav-item-selected';
    usersTab.className = 'nav-item';
    promotionsTab.className = 'nav-item';
}

function showUsers() {
    adminLocations.style.display = 'none';
    adminUsers.style.display = 'block';
    adminPromotions.style.display = 'none';
    
    locationsTab.className = 'nav-item';
    usersTab.className = 'nav-item-selected';
    promotionsTab.className = 'nav-item';
}

function showPromotions() {
    adminLocations.style.display = 'none';
    adminUsers.style.display = 'none';
    adminPromotions.style.display = 'block';
    
    locationsTab.className = 'nav-item';
    usersTab.className = 'nav-item';
    promotionsTab.className = 'nav-item-selected';
}

