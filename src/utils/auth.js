var request = require('node-fetch');

var clientId = process.env.SF_CLIENTID;
var clientSecret = process.env.SF_CLIENTSECRET;
var callbackUrl = process.env.CALLBACKURL;

var salesforceEndpoint = process.env.SF_ENDPOINT;

function login (req, res, next) {
    // we simply just redirect the user to the Salesforce login service.
    res.redirect(`${salesforceEndpoint}/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}&display=popup`);
};

function callback (req, res, next) {
    // first we harvest the code variable
    let authCode = req.query.code;

    // the URL that we are going to post the auth code to
    let tokenUrl = `${salesforceEndpoint}/services/oauth2/token`;
    // post to token url to get access token using the request library
    request.post(
        tokenUrl,
        {
            form: {
                code: authCode,
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackUrl
            },
            json: true
        },
        function (err, data) {
            // handle errors if present
            if (err) {
                return next(err);
            }
            // set session data in redis
            req.session.loginCounter++;
            req.session.authInfo = {
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                userId: data.body.id,
                signature: data.body.signature,
                instanceUrl: data.body.instance_url,
                issuedAt: data.body.issued_at,
                userIsAuthenticated: true
            }
            req.session.save();
            console.log('session data saved as: ' + JSON.stringify(req.session.authInfo));
            // send user back to homepage to view stats
            res.redirect('/');
        });
};

// logout function that revokes the oAuth token from Salesforce
function logout (req, res, next) {
    // first define the URL for the token revoke service
    let revokeUrl = `${salesforceEndpoint}/services/oauth2/revoke`;

    // POST request with data
    request.post(revokeUrl, {
        form: {
            token: req.session.authInfo.accessToken
        }
    }, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('everything is invalidated: ' + JSON.stringify(data));
        // destroy the session and redirect to root
        req.session.destroy();
        res.redirect('/');
    });
}

// function to check if logged in
function isLoggedIn (err, req, res, next) {
    if (err) {
        return next(err);
    }
    if (!req.session.authInfo.userIsAuthenticated) {
        console.log('user must login first!');
        res.redirect('/');
    } else {
        next();
    }
}

// Export the functions to be used in the router.
module.exports = {
    login: login,
    callback: callback,
    logout: logout,
    isLoggedIn: isLoggedIn
}