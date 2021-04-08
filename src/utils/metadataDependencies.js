const fetch = require('node-fetch');

const token = '00D290000001SaY!AR0AQBMxN1AiNIjdY9SCDbl89Fj3WjNS2q0QoXG3JItRjv49Gv5YqcZzqnvh7ZfrBggGIelTKu_GVUdGzVC5a5qWa5ot5L2K';

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
                resolve(result);
            })
            .catch((error) => reject(error));
    })
}

const queryDependencies = new Promise((resolve, reject) => {
    const url = 'https://maxhnb--mattvdev.my.salesforce.com/services/data/v51.0/tooling/jobs/query/';
    const requestBody = {
        operation: 'query',
        query: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentType = \'ApexClass\''
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