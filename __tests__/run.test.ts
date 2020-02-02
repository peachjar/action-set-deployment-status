import { has } from 'lodash'
import { GitHub } from '@actions/github'
import { Context } from '@actions/github/lib/context'

import run from '../src/run'

describe('Run function', () => {
    let context: Context
    let GitHub: { new(token: string): GitHub }
    let core: {
        getInput: (key: string, opts?: { required: boolean }) => string
        setOutput: (name: string, value: string) => void
        info: (...args: any[]) => void
        setFailed: (message: string) => void
        [k: string]: any
    }
    let createDeploymentStatus: jest.Mock
    let inputs: Record<string, string>

    beforeEach(() => {
        context = ({
            repo: { owner: 'peachjar', repo: 'foobaz' }
        } as any) as Context
        createDeploymentStatus = jest.fn(() =>
            Promise.resolve({
                data: {
                    id: 1234567890
                }
            })
        )
        GitHub = (class {
            constructor(token: string) {}
            repos = {
                createDeploymentStatus: createDeploymentStatus
            }
        } as any) as { new(token: string): GitHub }
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
            await run(context, GitHub, core)
            expect(createDeploymentStatus).toHaveBeenCalledWith({
                owner: 'peachjar',
                repo: 'foobaz',
                deployment_id: 987654321,
                state: 'success',
                description: 'Deployment was successful.'
            })
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
            await run(context, GitHub, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('[token]'))
        })
    })

    describe('when the deploymentId is invalid', () => {
        beforeEach(() => {
            inputs.deploymentId = ''
        })

        it('should set the action as failed', async () => {
            await run(context, GitHub, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('[deploymentId]'))
        })
    })

    describe('when the state is invalid', () => {
        beforeEach(() => {
            inputs.state = 'foobar'
        })

        it('should set the action as failed', async () => {
            await run(context, GitHub, core)
            expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('[state]'))
            expect(core.setOutput).not.toHaveBeenCalled()
        })
    })

    describe('when the request to create a deployment fails', () => {
        const error = new Error('Kaboom!')

        beforeEach(() => {
            createDeploymentStatus = jest.fn(() => Promise.reject(error))
        })

        it('should fail the action', async () => {
            await run(context, GitHub, core)
            expect(core.setFailed).toHaveBeenCalledWith(error.message)
            expect(core.setOutput).not.toHaveBeenCalled()
        })
    })
})
