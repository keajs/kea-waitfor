import { setPluginContext, getPluginContext } from "kea";

/* usage:
await waitFor(logic.actions.something)
*/

export async function waitForAction(action) {
  return new Promise((resolve, reject) => {
    const { byAction } = getPluginContext("waitFor");
    if (!byAction[action]) {
      byAction[action] = [];
    }
    byAction[action].push({ resolve, reject });
  });
}

export async function waitForCondition(condition) {
  const { conditions } = getPluginContext("waitFor");
  const promise = new Promise((resolve, reject) => {
    conditions.add({ validate: condition, resolve, reject });
  });
  return promise;
}

function reset() {
  setPluginContext("waitFor", { byAction: {}, conditions: new Set() });
}

export const waitForPlugin = {
  name: "waitFor",

  events: {
    afterPlugin() {
      reset();
    },

    beforeReduxStore(options) {
      options.middleware.push((store) => (next) => (action) => {
        const response = next(action);
        const pluginContext = getPluginContext("waitFor");
        const { byAction, conditions } = pluginContext;

        if (byAction[action.type]) {
          const actionWaiters = byAction[action.type];
          delete byAction[action.type];
          actionWaiters.forEach(({ resolve }) => resolve(action.payload));
        }

        if (conditions.size > 0) {
          for (let condition of conditions.values()) {
            if (condition.validate(action)) {
              condition.resolve(action.payload);
              conditions.delete(condition);
            }
          }
        }

        return response;
      });
    },

    beforeCloseContext() {
      reset();
    },
  },
};
