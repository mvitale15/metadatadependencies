const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config({path: 'src/config/.env'});

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

console.log(process.env);

const getDependencies = require('./utils/metadataDependencies');
const getClasses = require('./utils/apexClasses');
const auth = require('./utils/auth');

app.get('', (req, res) => {
    let results = {};
    console.log(req);
    console.log(res);
    getDependencies()
     .then((result) => {
        //console.log(result);
        results.dependencies = result;
        return getClasses();
     })
     .then((result) => {
        results.apexClasses = result;
        res.send(results);
        //console.log(result)
     })
})

app.get('/login', (req, res) => {
    auth.login(req, res);
});

// const auth = () => {
//     const url = `https://test.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${process.env.SF_CLIENTID}&redirect_uri=localhost:3000&state=mystate`;
//     //const url = 'https://maxhnb--mattvdev.my.salesforce.com/services/data/v51.0/tooling/jobs/query/';
//     /*const requestBody = {
//         operation: 'query',
//         query: 'SELECT MetadataComponentId, MetadataComponentName, MetadataComponentType, RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType FROM MetadataComponentDependency WHERE RefMetadataComponentType = \'ApexClass\''
//     }*/

//     fetch(url, { 
//         method: 'POST', 
//         /*body: JSON.stringify(requestBody),
//         headers: {'Authorization': `Bearer ${token}`,
//                   'Content-Type': 'application/json'
//                 } */
//     })
//     .then(res => res.json())
//     .then(json => resolve(json))
//     .catch(error => reject(Error(error)));
// })


// getDependencies()
//     .then((result) => {
//         console.log(result);
//     })

app.listen(port, () => {
    console.log(`server started port ${port}`);
});