const fetch = require('node-fetch');
let token;
let instance = 'https://test.salesforce.com/';

const getClasses = async (accessToken, instanceURL) => {
    token = accessToken;
    instance = instanceURL;

    let apexClasses = [];

    try{
        const job = await queryClasses();
        await queryJobStatus(job.id);
        const results = await getResults(job.id);
        
        let cleanedString = results.replace(/"/g, '');

        cleanedString.split(/\r?\n/).forEach((el, i) => {
            if(i !== 0){
                let record = el.split(",");
                apexClasses.push(
                    {
                        Id: record[0],
                        Name: record[1]
                    }
                )
            }
        })
    
        return apexClasses;
    } catch(e){
        console.error(e);
    }
}

const queryClasses = async () => {    
    const query = encodeURIComponent('SELECT Id, Name, NamespacePrefix FROM ApexClass WHERE NamespacePrefix = null ORDER BY Name ASC');
    const url = `${instance}/services/data/${process.env.SF_API}/jobs/query`;

    try{
        const requestBody = {
            operation: 'query',
            query: 'SELECT Id, Name, NamespacePrefix FROM ApexClass WHERE NamespacePrefix = null ORDER BY Name ASC'
        }

        const res = await fetch(url, { 
                                        method: 'POST',
                                        body: JSON.stringify(requestBody),
                                        headers: {'Authorization': `Bearer ${token}`,
                                                'Content-Type': 'application/json'
                                                } 
                                    })
        const json = await res.json();
        return json;
    } catch(e) {
        console.error(e);
    }
}

const queryJobStatus = async (jobId) => {
    const url = `${instance}/services/data/${process.env.SF_API}/jobs/query/${jobId}`;
    
    try{
        const res = await fetch(url, { 
                                            method: 'GET', 
                                            headers: {'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                    } 
                                        })
        const json = await res.json();
        if(json.state == 'InProgress' || json.state == 'UploadComplete') {
            return queryJobStatus(jobId);
        } else {
            return json;
        }                                
    } catch(e){
        console.error(e);
    }
}

const getResults = async (jobId) => {
    const url = `${instance}/services/data/${process.env.SF_API}/jobs/query/${jobId}/results`;
    try {
        const res = await fetch(url, { 
                                        method: 'GET', 
                                        headers: {'Authorization': `Bearer ${token}`,
                                                'Content-Type': 'application/json'
                                                } 
                                    })
        const body = res.text();
        return body;
    } catch(e) {
        console.error(e);
    }
}

module.exports = getClasses;