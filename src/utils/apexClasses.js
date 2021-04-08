const fetch = require('node-fetch');

const token = '00D290000001SaY!AR0AQBMxN1AiNIjdY9SCDbl89Fj3WjNS2q0QoXG3JItRjv49Gv5YqcZzqnvh7ZfrBggGIelTKu_GVUdGzVC5a5qWa5ot5L2K';

const getClasses = () => {
    return new Promise((resolve, reject) => {
        queryClasses
            .then((result) => {
                resolve(result);
            })
            .catch((error) => reject(error));
    })
}

const queryClasses = new Promise((resolve, reject) => {
    const query = encodeURIComponent('SELECT Id, Name FROM ApexClass WHERE NamespacePrefix = NULL');
    const url = `https://maxhnb--mattvdev.my.salesforce.com/services/data/v51.0/query/?q=${query}`;

    fetch(url, { 
        method: 'GET', 
        headers: {'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                } 
    })
    .then(res => res.json())
    .then(json => resolve(json))
    .catch(error => reject(Error(error)));
})

module.exports = getClasses;