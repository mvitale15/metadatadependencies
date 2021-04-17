const fetch = require('node-fetch');
let token;
let instance = 'https://test.salesforce.com/';

const getClasses = async (accessToken, instanceURL) => {
    token = accessToken;
    instance = instanceURL;

    let apexClasses = [];

    try{
        const results = await queryClasses();

        results.records.forEach(el => {
            apexClasses.push(
                {
                    Id: el.Id,
                    Name: el.Name,
                }
            )
        })
    
        return apexClasses;
    } catch(e){
        console.error(e);
    }
}

const queryClasses = async () => {    
    const query = encodeURIComponent('SELECT Id, Name, NamespacePrefix FROM ApexClass WHERE NamespacePrefix = null ORDER BY Name ASC');
    const url = `${instance}/data/${process.env.SF_API}/query/?q=${query}`;

    try{
        const res = await fetch(url, { 
                                        method: 'GET', 
                                        headers: {'Authorization': `Bearer ${token}`,
                                                'Content-Type': 'application/json'
                                                } 
                                    })
        console.log(res);
        const json = await res.json();
        return json;
    } catch(e) {
        console.error(e);
    }
}

module.exports = getClasses;