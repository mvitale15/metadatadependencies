const express = require('express');
const nforce = require('nforce');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


dotenv.config({path: './config/.env'});

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 3000;

const getDependencies = require('./utils/metadataDependencies');
const getClasses = require('./utils/apexClasses');

const org = nforce.createConnection({
    clientId: process.env.SF_CLIENTID,
    clientSecret: process.env.SF_CLIENTSECRET,
    redirectUri: 'http://localhost:3000/auth/sfdc/callback',
    apiVersion: process.env.SF_API,  // optional, defaults to current salesforce API version
    environment: 'sandbox'//,  // optional, salesforce 'sandbox' or 'production', production default
    //mode: 'multi' // optional, 'single' or 'multi' user mode, multi default
  });

app.get('/auth/sfdc', function(req,res){
    res.redirect(org.getAuthUri());
});

app.get('/auth/sfdc/callback', function(req, res) {

    org.authenticate({code: req.query.code}, function(err, resp){
        if(!err) {
            res
                .cookie('accessToken', resp.access_token,  { 
                    expires: new Date(Date.now() + 8 * 3600000),
                    httpOnly: true,
                    secure: false
                })
                .cookie('instanceURL', resp.instance_url,  { 
                    expires: new Date(Date.now() + 8 * 3600000),
                    httpOnly: true,
                    secure: false
                })
                .redirect('/metadatadepdencies');
        } else {
            console.error('Error: ' + err.message);
        }
    });
});

app.get('/metadatadepdencies', async (req, res) => {
    try{
        const dependencies = await getDependencies(req.cookies.accessToken, req.cookies.instanceURL);
        const classes = await getClasses(req.cookies.accessToken, req.cookies.instanceURL);

        const results = classes.filter((obj) => {
            let name = obj.Name ? obj.Name.toLowerCase() : '';

            return (!(obj.Id in dependencies) && !(name.includes('test')));
        });

        res.send(results);
    } catch(e){
        res.status(500).send(e);
    }
})

app.listen(port, () => {});