const fetch = require('node-fetch');

const token = '00D290000001SaY!AR0AQH8y1fj6L06m6NyLevJL47B3pIQw2d42kQL3OxSkdNYdlCsYjhorW5S8yfcTtbNTDVpWUu7CRytYjvE4c4pTC6faPhWS';

const getClasses = () => {
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