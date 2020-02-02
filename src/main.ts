import * as core from '@actions/core'
import * as github from '@actions/github'
import axios from 'axios'

import run from './run'

run(github.context, axios.create(), core)
