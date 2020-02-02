<p align="center">
  <a href="https://github.com/peachjar/action-set-deployment-status/actions"><img alt="typescript-action status" src="https://github.com/peachjar/action-set-deployment-status/workflows/build-test/badge.svg"></a>
</p>

# Github Action: Set Deployment Status

Create a Github "Deployment Status" for a Github "Deployment" object associated to a Repository.  These objects/events are great for hooking on other actions like notifications, etc.

## Usage

```
uses: peachjar/action-set-deployment-status@v1
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  deploymentId: ${{ steps.deploy.outputs.deployment_id }}
  state: success
  description: Deployment was successful
```
