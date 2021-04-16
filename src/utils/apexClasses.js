const fetch = require('node-fetch');

const getClasses = (accessToken, instanceURL) => {
    return new Promise((resolve, reject) => {
        queryClasses
            .then((result) => {
                let apexClasses = [];

                result.records.forEach(el => {
                    apexClasses.push(
                        {
                            Id: el.Id,
                            Name: el.Name,
                        }
                    )
                })
                resolve(apexClasses);
            })
            .catch((error) => reject(error));
    })
}

const queryClasses = new Promise((resolve, reject) => {
    const query = encodeURIComponent('SELECT Id, Name, NamespacePrefix FROM ApexClass WHERE NamespacePrefix = null ORDER BY Name ASC');
    //const url = `${process.env.SF_INSTANCE_URL}/services/data/${process.env.SF_API}/query/?q=${query}`;
    const url = `https://test.salesforce.com/services/data/${process.env.SF_API}/query/?q=${query}`;
    fetch(url, { 
        method: 'GET', 
        headers: {'Authorization': `Bearer ${process.env.SF_AUTH_TOKEN }`,
                  'Content-Type': 'application/json'
                } 
    })
    .then(res => res.json())
    .then(json => resolve(json))
    .catch(error => reject(Error(error)));
})

module.exports = getClasses;