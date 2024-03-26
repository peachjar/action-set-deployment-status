<p align="center">
  <a href="https://github.com/peachjar/action-set-deployment-status/actions"><img alt="typescript-action status" src="https://github.com/peachjar/action-set-deployment-status/workflows/build-test/badge.svg"></a>
</p>

# Github Action: Set Deployment Status

Create a Github "Deployment Status" for a Github "Deployment" object associated to a Repository.  These objects/events are great for hooking on other actions like notifications, etc.
The integration with Slack was added to trigger a message when the deployment status is 'failure'.

## Usage

```
uses: peachjar/action-set-deployment-status@v3
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  deploymentId: ${{ steps.deploy.outputs.deployment_id }}
  state: success
  description: Deployment was successful
```
## With Slack integration when state is failure

```
uses: peachjar/action-set-deployment-status@v3
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  deploymentId: ${{ steps.deploy.outputs.deployment_id }}
  state: failure
  description: Deployment was successful
  channelId: ${{ secrets.SLACK_CHANNEL }}
  slackToken: ${{ secrets.SLACK_TOKEN }}
```