
function fetchUsers() {
    const usersRef = database.collection('users');
    return usersRef.get().then(snapshot => {
        
            if (snapshot.empty) {
                console.log('No matching documents.');
                return [];
            }

            let users = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id; // Including the document ID
                users.push(data);
            });

            users.sort((a, b) => b.dateCreated - a.dateCreated);
            return users;
        })
        .then(users => {
            renderUsers(users);
            document.getElementById('user-count-header').innerHTML = `${users.length} Users`
        })
        .catch(error => {
            console.error("Error fetching users: ", error);
            throw error;
        });
}




function renderUsers(users) {
    users.forEach(user => {
        // Parent Div
        const rowParent = createDOMElement('div', 'row-parent', '', usersTable);

        // Profile Photo & Full Name
        let userNameDiv = createDOMElement('div', 'row-div-20', "", rowParent);
        if (user.profilePhoto && user.profilePhoto.trim() !== "") {
            createDOMElement('img', 'user-profile-photo', user.profilePhoto, userNameDiv);
        } else {
            const initials = getInitials(user.name);
            createDOMElement('div', 'profile-photo-default', initials, userNameDiv);
        }
        createDOMElement('div', 'row-text', user.name, userNameDiv);
        
        //Email, Date Created, numContributions
        createDOMElement('div', 'row-div-20 row-text', user.email, rowParent);
        createDOMElement('div', 'row-div-20 row-text', formatDate(user.dateCreated), rowParent);
        createDOMElement('div', 'row-div-20 row-text', user.numContributions, rowParent);

        //Actions
        let actionsContainer = createDOMElement('div', 'row-div-20', '', rowParent);
        let declineButton = createDOMElement('div', 'decline-button', 'Ban', actionsContainer);

        
    });
}




//Helper functions
// Assuming `timestamp` is an object with `seconds` (required by Firebase SDK)
function formatDate(timestamp) {
    if (!timestamp) return '';
    
    // Convert Firebase Timestamp to JavaScript Date object
    const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' };
    
    // Format date to a more readable form
    return date.toLocaleDateString('en-US', options);
}

function getInitials(fullName) {
    const names = fullName.split(' ');
    let initials = names.map(name => name[0].toUpperCase()).join('');
    return initials.slice(0, 2);
}

