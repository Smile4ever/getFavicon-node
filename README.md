# getFaviconUrl-node

Retrieve the favicon of a website. Based on https://github.com/odebroqueville/getFaviconUrl

It has been configured to be easy to setup with now.sh, but can be hosted in Heroku as well.

getFaviconUrl-node uses 3 node.js modules: [request](https://github.com/request/request), express and [cheerio](https://github.com/cheeriojs/cheerio).

# How to run locally

    node index.js

Go go localhost/icon?url=google.be to see an example result.

In case of access denied, try to run with more priviledges (root or administrator account).

# Deploying a new version using now.sh

Note: if you are not the owner of https://getfaviconurl-node.now.sh you will have to change now.json to use a different alias.

To deploy, execute the command `now` in the command line:

    now
    
To set the new deployment to production, execute `now alias`:

    now alias

The application should now be available at https://getfaviconurl-node.now.sh

# Deploying a new version using Heroku

This code can also be deployed using Heroku. Just connect this repository to a new app and deploy.
