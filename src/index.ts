import { setPluginContext, getPluginContext, KeaPlugin } from 'kea'

/* usage:
await waitFor(logic.actions.something)
*/

export type ReduxAction = { type: string; payload: Record<string, any> }
export type ConditionFunction = (action: ReduxAction) => boolean
export type PaylodResolve = (payload: Record<string, any>) => void

type PluginContext = {
  byAction: Record<string, { resolve: PaylodResolve }[]>
  conditions: Set<{
    validate: ConditionFunction
    resolve: PaylodResolve
  }>
}

export async function waitForAction(actionOrActionType: ((...args: any[]) => void) | string) {
  const actionType = typeof actionOrActionType === 'string' ? actionOrActionType : actionOrActionType.toString()
  return new Promise((resolve) => {
    const { byAction } = getPluginContext('waitFor') as PluginContext
    if (!byAction[actionType]) {
      byAction[actionType] = []
    }
    byAction[actionType].push({ resolve })
  })
}

export async function waitForCondition(condition: ConditionFunction) {
  const { conditions } = getPluginContext('waitFor') as PluginContext
  return new Promise((resolve) => {
    conditions.add({ validate: condition, resolve })
  })
}

function reset() {
  setPluginContext('waitFor', { byAction: {}, conditions: new Set() } as PluginContext)
}

export const waitForPlugin: () => KeaPlugin = () => ({
  name: 'waitFor',

  events: {
    afterPlugin() {
      reset()
    },

    beforeReduxStore(options) {
      options.middleware.push((store) => (next) => (action: ReduxAction) => {
        const response = next(action)
        const { byAction, conditions } = getPluginContext('waitFor') as PluginContext

        if (byAction[action.type]) {
          const actionWaiters = byAction[action.type]
          delete byAction[action.type]
          actionWaiters.forEach(({ resolve }) => resolve(action.payload))
        }

        if (conditions.size > 0) {
          conditions.forEach((condition) => {
            if (condition.validate(action)) {
              condition.resolve(action.payload)
              conditions.delete(condition)
            }
          })
        }

        return response
      })
    },

    beforeCloseContext() {
      reset()
    },
  },
})
