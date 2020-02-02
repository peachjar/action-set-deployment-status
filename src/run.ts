import { GitHub } from '@actions/github'
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

export default async function run(
    context: Context,
    GitHub: { new(token: string): GitHub },
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

        const deployment_id = parseInt(core.getInput('deploymentId', { required: true }) || '-1', 10)

        if (deployment_id < 1) {
            return core.setFailed('[deploymentId] is not valid.')
        }

        const state = (core.getInput('state', { required: true }) || '').toLowerCase() as States

        if (!validStates.includes(state))  {
            return core.setFailed('[state] is not valid.')
        }

        const description = core.getInput('description') || undefined

        const octokit = new GitHub(token)

        const status = await octokit.repos.createDeploymentStatus({
            owner: context.repo.owner,
            repo: context.repo.repo,
            deployment_id,
            state,
            description,
        })

        core.info(`Deployment status set: ${deployment_id}`)

        core.setOutput('deployment_status_id', `${status.data.id}`)

    } catch (error) {
        core.setFailed(error.message)
    }
}
