import { getEnv } from '@l2beat/backend-tools'
import { UnixTime } from '@l2beat/shared-pure'

import { Config } from './Config'
import { makeConfig } from './makeConfig'

export type { Config }

export function getConfig(): Config {
  const env = getEnv()
  const deploymentEnv = env.optionalString('DEPLOYMENT_ENV') ?? 'local'
  console.log('Loading config for:', deploymentEnv)

  switch (deploymentEnv) {
    case 'local':
      return makeConfig(env, {
        name: 'Backend/Local',
        isLocal: true,
        minTimestampOverride: env.optionalBoolean('NO_TIMESTAMP_OVERRIDE')
          ? undefined
          //: UnixTime.now().add(-90, 'days').toStartOf('hour'),
          : undefined
      })
    case 'staging':
      return makeConfig(env, { name: 'Backend/Staging' })
    case 'production':
      return makeConfig(env, { name: 'Backend/Production' })
  }

  throw new TypeError(`Unrecognized env: ${deploymentEnv}!`)
}
