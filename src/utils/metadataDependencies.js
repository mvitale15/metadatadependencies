const fetch = require('node-fetch');

const token = '00D290000001SaY!AR0AQH8y1fj6L06m6NyLevJL47B3pIQw2d42kQL3OxSkdNYdlCsYjhorW5S8yfcTtbNTDVpWUu7CRytYjvE4c4pTC6faPhWS';

const getDependencies = () => {
    return new Promise((resolve, reject) => {
        queryDependencies
            .then((result) => {
                return queryJobStatus(result.id)    
            })
            .then((result) => {
                return getResults(result.id);
            })
            .then((result) => {
                let dependencies = [];
                let cleanedString = result.replace(/"/g, '');
        
                cleanedString.split(/\r?\n/).forEach((el, i) => {
                    if(i !== 0){
                        let record = el.split(",");
                        dependencies.push(
                            {
                                MetadataComponentId: record[0],
                                MetadataComponentName: record[1],
                                MetadataComponentType: record[2],
                                RefMetadataComponentId: record[3],
                                RefMetadataComponentName: record[4],
                                RefMetadataComponentType: record[5]
                            }
                        )
                    }
                   
                })
                resolve(dependencies);
            })
            .catch((error) => reject(error));
    })
}

const queryDependencies = new Promise((resolve, reject) => {
    const url = 'https://maxhnb--mattvdev.my.salesforce.com/services/data/v51.0/tooling/jobs/query/';
    const requestBody = {
        operation: 'query',
        query: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentType = \'ApexClass\' ORDER BY RefMetadataComponentName ASC'
    }

    fetch(url, { 
        method: 'POST', 
        body: JSON.stringify(requestBody),
        headers: {'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                } 
    })
    .then(res => res.json())
    .then(json => resolve(json))
    .catch(error => reject(Error(error)));
})


const queryJobStatus = (jobId) => {
    return new Promise((resolve, reject) => {
        const url = `https://maxhnb--mattvdev.my.salesforce.com/services/data/v51.0/tooling/jobs/query/${jobId}`;

        fetch(url, { 
            method: 'GET', 
            headers: {'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    } 
        })
        .then(res => res.json())
        .then(json => {
            if(json.state == 'InProgress' || json.state == 'UploadComplete') {
                return resolve(queryJobStatus(jobId));
            } else {
                resolve(json);
            }
        })
        .catch(error => reject(Error(error)));
    })
}

const getResults = (jobId) => {
    return new Promise((resolve, reject) => {
        const url = `https://maxhnb--mattvdev.my.salesforce.com/services/data/v51.0/tooling/jobs/query/${jobId}/results`;

        fetch(url, { 
            method: 'GET', 
            headers: {'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    } 
        })
        .then(res => res.text())
        .then(body => resolve(body))
        .catch(error => reject(Error(error)));
    })
}

module.exports = getDependencies;