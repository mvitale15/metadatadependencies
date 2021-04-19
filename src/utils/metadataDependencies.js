const BulkQuery = require('./bulkQuery');

const getDependencies = async (accessToken, instanceURL) => {
    let dependencies = {};

    try{
        const bq = new BulkQuery(accessToken, instanceURL);
        bq.setUseToolingAPI();
        const query = 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentType = \'ApexClass\' ORDER BY RefMetadataComponentName ASC';
        
        const job = await bq.submitQueryJob(query);
        await bq.checkQueryJobStatus(job.id);
        const results = await bq.getQueryResults(job.id);

        const jsonResults = bq.json(results);

        jsonResults.forEach(el => {
            let dependentComponentName = el.MetadataComponentName ? el.MetadataComponentName.toLowerCase() : '' ;

            if(!(dependentComponentName.includes('test'))){
                if(dependencies[el.RefMetadataComponentId]) {
                    dependencies[el.RefMetadataComponentId] = [...dependencies[el.RefMetadataComponentId], el];
                } else {
                    dependencies[el.RefMetadataComponentId] = [el];
                }
            }

        })
        
        return dependencies;
    } catch(e){
        console.error(e);
    }
}


module.exports = getDependencies;