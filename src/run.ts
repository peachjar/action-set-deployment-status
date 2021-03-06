import { get } from 'lodash'
import { AxiosInstance, AxiosError } from 'axios'
import { Context } from '@actions/github/lib/context'

enum States {
    Error = 'error',
    Failure = 'failure',
    Inactive = 'inactive',
    InProgress = 'in_progress',
    Queued = 'queued',
    Pending = 'pending',
    Success = 'success'
}

const validStates = Object.values(States)

interface GitHubRepository {
    owner: string,
    repo: string,
}

export default async function run(
    context: Context,
    githubClient: AxiosInstance,
    core: {
        getInput: (key: string, opts?: { required: boolean }) => string
        setOutput: (name: string, value: string) => void
        info: (...args: any[]) => void
        setFailed: (message: string) => void
        [k: string]: any
    }
): Promise<void> {
    try {
        const token = core.getInput('token', { required: true })

        if (!token) {
            return core.setFailed('[token] not supplied or invalid.')
        }

        const deploymentId = parseInt(core.getInput('deploymentId', { required: true }) || '-1', 10)

        if (deploymentId < 1) {
            return core.setFailed('[deploymentId] is not valid.')
        }

        const state = (core.getInput('state', { required: true }) || '').toLowerCase() as States

        if (!validStates.includes(state))  {
            return core.setFailed('[state] is not valid.')
        }

        const description = core.getInput('description') || undefined

        // Default to current repo, but if provided, trigger deployment on another
        let deployRepo: GitHubRepository = context.repo
        const deployRepoParam = core.getInput('repository')
        if (deployRepoParam !== '') {
            const [ owner, repo ] = deployRepoParam.split('/')
            deployRepo = {
                owner,
                repo,
            }
        }

        const url = `https://api.github.com/repos/${deployRepo.owner}/${deployRepo.repo}/deployments/${deploymentId}/statuses`

        const payload = { state, description }

        const { data } = await githubClient.post(url, payload, {
            headers: {
                'authorization': `Bearer ${token}`,
                'accept': 'application/vnd.github.ant-man-preview+json, application/vnd.github.flash-preview+json',
                'content-type': 'application/json',
            }
        })

        core.info(`Deployment status set: ${deploymentId}`)

        core.setOutput('deployment_status_id', `${data.id}`)

    } catch (error) {

        if ((error as AxiosError).isAxiosError) {
            const axiosError = error as AxiosError
            const message = JSON.stringify(get(axiosError, 'response.data', 'Not response error'))
            core.info(`Axios Response Error [${axiosError.response?.status}]: ${message}`)
        }

        core.setFailed(error.message)
    }
}
