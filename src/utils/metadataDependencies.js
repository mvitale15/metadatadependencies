const { query } = require('express');
const fetch = require('node-fetch');

const getDependencies = async (accessToken, instanceURL) => {
    return new Promise((resolve, reject) => {
        const queryJob = await queryDependencies();
        await queryJobStatus(queryJob.id);
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
    //const url = `${process.env.SF_INSTANCE_URL}/services/data/${process.env.SF_API}/tooling/jobs/query/`;
    const url = `https://test.salesforce.com/services/data/${process.env.SF_API}/tooling/jobs/query/`;
    const requestBody = {
        operation: 'query',
        query: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentType = \'ApexClass\' ORDER BY RefMetadataComponentName ASC'
    }

    fetch(url, { 
        method: 'POST', 
        body: JSON.stringify(requestBody),
        headers: {'Authorization': `Bearer ${process.env.SF_AUTH_TOKEN}`,
                  'Content-Type': 'application/json'
                } 
    })
    .then(res => res.json())
    .then(json => resolve(json))
    .catch(error => reject(Error(error)));
})


const queryJobStatus = (jobId) => {
    return new Promise((resolve, reject) => {
        //const url = `${process.env.SF_INSTANCE_URL}/services/data/${process.env.SF_API}/tooling/jobs/query/${jobId}`;
        const url = `https://test.salesforce.com/services/data/${process.env.SF_API}/tooling/jobs/query/${jobId}`;
        fetch(url, { 
            method: 'GET', 
            headers: {'Authorization': `Bearer ${process.env.SF_AUTH_TOKEN}`,
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
        //const url = `${process.env.SF_INSTANCE_URL}/services/data/${process.env.SF_API}/tooling/jobs/query/${jobId}/results`;
        const url = `https://test.salesforce.com/services/data/${process.env.SF_API}/tooling/jobs/query/${jobId}/results`;
        fetch(url, { 
            method: 'GET', 
            headers: {'Authorization': `Bearer ${process.env.SF_AUTH_TOKEN}`,
                      'Content-Type': 'application/json'
                    } 
        })
        .then(res => res.text())
        .then(body => resolve(body))
        .catch(error => reject(Error(error)));
    })
}

module.exports = getDependencies;