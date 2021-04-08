const express = require('express');
const nforce = require('nforce');
const dotenv = require('dotenv');

dotenv.config({path: 'src/config/.env'});

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

const getDependencies = require('./utils/metadataDependencies');
const getClasses = require('./utils/apexClasses');
const auth = require('./utils/auth');

const org = nforce.createConnection({
    clientId: process.env.SF_CLIENTID,
    clientSecret: process.env.SF_CLIENTSECRET,
    redirectUri: '/auth/sfdc/callback',
    apiVersion: process.env.SF_API,  // optional, defaults to current salesforce API version
    environment: 'sandbox'//,  // optional, salesforce 'sandbox' or 'production', production default
    //mode: 'multi' // optional, 'single' or 'multi' user mode, multi default
  });

app.get('', (req, res) => {
    let results = {};
    //console.log(req);
    //console.log(res);
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
     .catch((error) => {
         console.error(error);
     })
})

app.get('/auth/sfdc', function(req,res){
    res.redirect(org.getAuthUri());
});

app.get('/auth/sfdc/callback', function(req, res) {
    console.log(req);
    org.authenticate({code: req.query.code}, function(err, resp){
        if(!err) {
        console.log('Access Token: ' + resp.access_token);
        } else {
        console.log('Error: ' + err.message);
        }
    });
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