const fetch = require('node-fetch');

class BulkQuery {
    useToolingAPI = false;
    accessToken;
    instance = 'https://test.salesforce.com/';

    constructor(accessToken, instance){
        this.accessToken = accessToken;
        this.instance = instance;
    }

    setUseToolingAPI() {
        this.useToolingAPI = true;
    }

    async submitQueryJob(query) {
        let url = `${this.instance}/services/data/${process.env.SF_API}`;
    
        if(this.useToolingAPI){
            url = `${url}/tooling/jobs/query/`;
        } else {
            url = `${url}/jobs/query/`;
        }
        
        try{
            const requestBody = {
                operation: 'query',
                query
            }

            const res = await fetch(url, { 
                                            method: 'POST', 
                                            body: JSON.stringify(requestBody),
                                            headers: {'Authorization': `Bearer ${this.accessToken}`,
                                                    'Content-Type': 'application/json'
                                                    } 
                                        })
            const json = await res.json();
            return json;
        } catch(e){
            console.error(e);
        }
    }

    async checkQueryJobStatus(jobId) {
        let url = `${this.instance}/services/data/${process.env.SF_API}`;
    
        if(this.useToolingAPI){
            url = `${url}/tooling/jobs/query/${jobId}`;
        } else {
            url = `${url}/jobs/query/${jobId}`;
        }
        
        try{
            const res = await fetch(url, { 
                                                method: 'GET', 
                                                headers: {'Authorization': `Bearer ${this.accessToken}`,
                                                        'Content-Type': 'application/json'
                                                        } 
                                            })
            const json = await res.json();
            if(json.state == 'InProgress' || json.state == 'UploadComplete') {
                return this.checkQueryJobStatus(jobId);
            } else {
                return json;
            }                                
        } catch(e){
            console.error(e);
        }
    }

    async getQueryResults(jobId) {
        let url = `${this.instance}/services/data/${process.env.SF_API}`;
    
        if(this.useToolingAPI){
            url = `${url}/tooling/jobs/query/${jobId}/results`;
        } else {
            url = `${url}/jobs/query/${jobId}/results`;
        }
    
        try {
            const res = await fetch(url, { 
                                            method: 'GET', 
                                            headers: {'Authorization': `Bearer ${this.accessToken}`,
                                                    'Content-Type': 'application/json'
                                                    } 
                                        })
            const body = res.text();
            return body;
        } catch(e) {
            console.error(e);
        }
    }

    json(results){
        let cleanedString = results.replace(/"/g, '');
        let jsonArray = [];
        let headers;

        cleanedString.split(/\r?\n/).forEach((el, i) => {
            let record = el.split(",");

            if(i === 0){
                headers = record;
            } else if(record[0] !== ''){
                let jsonRecord = {};

                for(i = 0; i<headers.length-1; i++) {
                    jsonRecord[headers[i]] = record[i];
                }
                
                jsonArray.push(jsonRecord);
            }
        })

        return jsonArray;
    }
}

module.exports = BulkQuery;