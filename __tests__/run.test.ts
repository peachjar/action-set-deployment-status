import { has } from 'lodash'
import { Context } from '@actions/github/lib/context'
import { AxiosInstance } from 'axios'

import run from '../src/run'

describe('Run function', () => {
    let context: Context
    let githubClient: AxiosInstance
    let core: {
        getInput: (key: string, opts?: { required: boolean }) => string
        setOutput: (name: string, value: string) => void
        info: (...args: any[]) => void
        setFailed: (message: string) => void
        [k: string]: any
    }
    let inputs: Record<string, string>

    beforeEach(() => {
        context = ({
            repo: { owner: 'peachjar', repo: 'foobaz' }
        } as any) as Context
        githubClient = {
            post: jest.fn(() =>
                Promise.resolve({
                    data: {
                        id: 1234567890
                    }
                })
            )
        } as any as AxiosInstance
        inputs = {
            token: 'footoken',
            deploymentId: '987654321',
            state: 'success',
            description: 'Deployment was successful.',
        }
        core = {
            getInput: jest.fn((key: string) => {
                if (!has(inputs, key)) {
                    throw new Error(`Invalid property [${key}] accessed.`)
                }
                return inputs[key]
            }),
            setOutput: jest.fn(),
            info: jest.fn(),
            setFailed: jest.fn()
        }
    })

    describe('when a deployment status update is requested', () => {
        it('should call Github to create a deployment status object', async () => {
            await run(context, githubClient, core)
            expect(githubClient.post).toHaveBeenCalledWith(
            expect.stringContaining(
                'repos/peachjar/foobaz/deployments/987654321/statuses'),
                {
                    state: 'success',
                    description: 'Deployment was successful.'
                },
                {
                    headers: {
                        'authorization': 'Bearer footoken',
                        'accept': 'application/vnd.github.ant-man-preview+json, application/vnd.github.flash-preview+json',
                        'content-type': 'application/json',
                    },
                }
            )
            expect(core.info).toHaveBeenCalled()
            expect(core.setFailed).not.toHaveBeenCalled()
            expect(core.setOutput).toHaveBeenCalledWith('deployment_status_id', '1234567890')
        })
    })

    describe('when the token is invalid', () => {
        beforeEach(() => {
            inputs.token = ''
        })

        it('should set the action as failed', async () => {
            await run(context, githubClient, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('[token]'))
        })
    })

    describe('when the deploymentId is invalid', () => {
        beforeEach(() => {
            inputs.deploymentId = ''
        })

        it('should set the action as failed', async () => {
            await run(context, githubClient, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('[deploymentId]'))
        })
    })

    describe('when the state is invalid', () => {
        beforeEach(() => {
            inputs.state = 'foobar'
        })

        it('should set the action as failed', async () => {
            await run(context, githubClient, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('[state]'))
            expect(core.setOutput).not.toHaveBeenCalled()
        })
    })

    describe('when the request to create a deployment fails', () => {
        const error = new Error('Kaboom!')

        beforeEach(() => {
            githubClient.post = jest.fn(() => Promise.reject(error))
        })

        it('should fail the action', async () => {
            await run(context, githubClient, core)
            expect(core.setFailed).toHaveBeenCalledWith(error.message)
            expect(core.setOutput).not.toHaveBeenCalled()
        })
    })
})
