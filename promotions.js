
function fetchPromotions() {
    const promotionsRef = database.collection('promotions');
    return promotionsRef.get().then(snapshot => {
        
            if (snapshot.empty) {
                console.log('No matching documents.');
                return [];
            }

            let promotions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id; // Including the document ID
                promotions.push(data);
            });

            promotions.sort((a, b) => b.expirationDate - a.expirationDate);
            return users;
        })
        .then(promotions => {
            renderPromotions(promotions);
        })
        .catch(error => {
            console.error("Error fetching users: ", error);
            throw error;
        });
}




function renderPromotions(promotions) {
    promotions.forEach(promotion => {
        // Parent Div
        const rowParent = createDOMElement('div', 'row-parent', '', promotionsTable);

        // Profile Photo & Full Name
        let promotionType = createDOMElement('div', 'row-div-20', "", rowParent);
        if promotion.type == "shoutout" {
            createDOMElement('div', 'row-text', "📣📣 Shoutout", promotionType);
        } else {
            createDOMElement('div', 'row-text', "🎉🎉 Promotion", promotionType);

        }
        
        createDOMElement('div', 'row-div-20 row-text', promotion.type, rowParent);
        createDOMElement('div', 'row-div-20 row-text', formatDate(promotion.expirationDate), rowParent);
        createDOMElement('div', 'row-div-20 row-text', promotion.userID, rowParent);
        createDOMElement('div', 'row-div-20 row-text', promotion.status, rowParent);
        
    });
}


