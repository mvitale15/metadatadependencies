const BulkQuery = require('./bulkQuery');

const getClasses = async (accessToken, instanceURL) => {
    try{
        const bq = new BulkQuery(accessToken, instanceURL);
        
        const query = 'SELECT Id, Name, NamespacePrefix FROM ApexClass WHERE NamespacePrefix = null ORDER BY Name ASC';
        const job = await bq.submitQueryJob(query)
        await bq.checkQueryJobStatus(job.id);
        const results = await bq.getQueryResults(job.id);
    
        return bq.json(results);
    } catch(e){
        console.error(e);
    }
}

module.exports = getClasses;