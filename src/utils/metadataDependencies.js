const fetch = require('node-fetch');
let token;
let instance = 'https://test.salesforce.com/';

const getDependencies = async (accessToken, instanceURL) => {
    token = accessToken;
    instance = instanceURL;

    try{
        let dependencies = {};
        const queryJob = await queryDependencies();
        await queryJobStatus(queryJob.id);
        const results = await getResults(queryJob.id);

        let cleanedString = results.replace(/"/g, '');

        cleanedString.split(/\r?\n/).forEach((el, i) => {
            if(i !== 0){
                let record = el.split(",");
                const refId = record[3];

                let metadataComponentName = record[1] ? record[1].toLowerCase() : '' ;
                if(!(metadataComponentName.includes('test'))){
                    let dependency = {
                        MetadataComponentId: record[0],
                        MetadataComponentName: record[1],
                        MetadataComponentType: record[2],
                        RefMetadataComponentId: record[3],
                        RefMetadataComponentName: record[4],
                        RefMetadataComponentType: record[5]
                    }

                    if(dependencies[refId]) {
                        dependencies[refId] = [...dependencies[refId], dependency];
                    } else {
                        dependencies[refId] = [dependency];
                    }
                }
            }
        })
        return dependencies;
    } catch(e){
        console.error(e);
    }
}

const queryDependencies = async () => {
    const url = `${instance}/services/data/${process.env.SF_API}/tooling/jobs/query/`;

    try{
        const requestBody = {
            operation: 'query',
            query: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentType = \'ApexClass\' ORDER BY RefMetadataComponentName ASC'
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
    } catch(e){
        console.error(e);
    }
}


const queryJobStatus = async (jobId) => {
    const url = `${instance}/services/data/${process.env.SF_API}/tooling/jobs/query/${jobId}`;
    
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
    const url = `${instance}/services/data/${process.env.SF_API}/tooling/jobs/query/${jobId}/results`;
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

module.exports = getDependencies;