# Demo instructions

1. Start with this repo containing just a nextjs application
1. Setup azure and get secrets (note: if we own these resources this could be done internally in our service and we just provide a secret for them to add)
    1. Create resource group `az group create --location westus2 --name <resource-group-name>`
    1. Create service principal `az ad sp create-for-rbac --name "<app-name>" --role contributor --scopes /subscriptions/<subscription-id>/resourceGroups/<resource-group-name> --sdk-auth`
1. In GitHub, under repo settings > secrets add the following secrets:
    1. AZURE_CREDENTIALS : value from service principal command e.g:

        ```json
        {
            "clientId": "00000000-0000-0000-0000-000000000000",
            "clientSecret": "00000000-0000-0000-0000-000000000000",
            "subscriptionId": "00000000-0000-0000-0000-000000000000",
            "tenantId": "00000000-0000-0000-0000-000000000000",
            "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
            "resourceManagerEndpointUrl": "https://management.azure.com/",
            "activeDirectoryGraphResourceId": "https://graph.windows.net/",
            "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
            "galleryEndpointUrl": "https://gallery.azure.com/",
            "managementEndpointUrl": "https://management.core.windows.net/"
        }
        ```

    1. APP_SECRETS : JSON containing any application secrets you want to access from within your app e.g:

        ```json
        {
            "COSMOS_ENDPOINT": "<COSMOS_ENDPOINT>",
            "COSMOS_KEY": "<COSMOS_KEY>",
            "COSMOS_DATABASE": "<COSMOS_DATABASE>",
            "COSMOS_CONTAINER": "<COSMOS_CONTAINER>"
        }
        ```

    1. CONFIGURATION: JSON containing deployment configuration e.g.

        ```json
        {
            "subscriptionId": "<subscriptionId>",
            "resourceGroup": "<resourceGroup>",
            "location": "<location>",
            "name": "<function app name>",
            "storageAccount": "<storageAccount>"
        }
        ```

1. In GitHub, under actions add a new workflow:
    1. Select skip this step - we don't need a template.
    1. Name it `ci.yml`
    1. Use the following workflow to configure a CI action to run on every push to master:

        ```yml
        name: CI
        on:
          push:
            branches: master
        jobs:
          build:
            runs-on: ubuntu-latest
            steps:
            - name: Checkout
              uses: actions/checkout@v1
            - name: Azure Login
              uses: Azure/login@v1
              with:
                creds: ${{ secrets.AZURE_CREDENTIALS }}
            - name: npm install
              run: npm ci
            - name: Publish next function
              uses: thomasf7/publish-next-function@master
              with:
                configuration: ${{ secrets.CONFIGURATION }}
                app-settings: ${{ secrets.APPSETTINGS }}
        ```

    1. Select start commit to commit this change to master- this will trigger the action to run.
    1. Go to actions tab and watch it run.
    1. When complete browse to site at `https://<app-name>.azurewebsites.net`
    1. Browse to resource group in portal and show:
        1. Function app with 3 functions created for the non-static pages
        1. Storage account containing the assets, including the public image file and _next/pages/func__staticpage.html
1. Enable custom domain via azure cli (note: this could be configured via our service if we own the function app resources):
    1. `az functionapp config hostname add --subscription <subscription-id> --resource-group <resource-group-name> --name <app-name> --hostname <custom-domain>`
    1. Browse to `https://<custom-domain>` -> CERT ERROR!
1. Enable SSL cert (note: as above we could potentially manage this, but it is in preview and not yet supported by cli)
    1. In the portal browse to the function app.
    1. Under "Configured features" select "SSL certificates"
    1. Select "Private Key Certificates"
    1. Select "Create App Service Managed Certificate"
    1. Select the custom domain and "Create"
    1. Select "Bindings" tab
    1. Select "Add TLS/SSL Binding"
    1. Select custom domain, private certificate thumbprint, TLS/SSL Type and select "Add Binding"
    1. Browse to `https://<custom-domain>` -> no error
1. In GitHub, under actions add a new workflow:
    1. Select skip this step - we don't need a template.
    1. Name it pr.yml
    1. Use the following workflow to configure a PR action to run against each pull request action of the types opened, synchronize (i.e. changes made to the code), reopened or closed. This workflow defines two jobs, one that runs on all types except closed to build and deploy the pull request branch with `pull-request: true` configured, and a second which run when the type is closed and cleans up the resources created from the build job.

        ```yml
        name: Pull Request
        on:
          pull_request:
            types: [opened, synchronize, reopened, closed]
        jobs:
          pull_request:
            runs-on: ubuntu-latest
            steps:
            - name: Checkout
              if: github.event.action != 'closed'
              uses: actions/checkout@v1
            - name: npm install
              if: github.event.action != 'closed'
              run: npm ci
            - name: Azure Login
              uses: Azure/login@v1
              with:
                creds: ${{ secrets.AZURE_CREDENTIALS }}
            - name: Publish next function
              uses: thomasf7/publish-next-function@master
              with:
                configuration: ${{ secrets.CONFIGURATION }}
                app-settings: ${{ secrets.APPSETTINGS }}
                github_token: ${{ secrets.GITHUB_TOKEN }}
                pull-request: true
        ```

    1. Select start commit to commit this change to master.
1. Test it out - make some changes and create a PR.
    1. In GitHub, edit one of the pages.
    1. Select "Create a new branch for this commit and start a pull request" and create pull request.
    1. You should see the pull request action run and show on the pull request pages.
    1. When it finishes, browse to `https://<app-name>-<pr-id>.azurewebsites.net` and see the changes.
    1. Verify on production site changes are not live.
    1. Merge and complete the PR.
    1. View actions and see PR clean up job run to clean up resources (browsing to PR site will no longer work).
    1. CI build will deploy changes to production.
