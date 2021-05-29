/* global test, expect, beforeEach */
import { resetContext, kea, getPluginContext } from 'kea'

import { waitForAction, waitForCondition, waitForPlugin } from '../index'

beforeEach(() => {
  resetContext({
    plugins: [waitForPlugin],
  })
})

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

test('can wait for an action', async () => {
  let inc = 0
  const logic = kea({
    actions: () => ({
      start: true,
      stop: (value) => ({ value }),
    }),

    listeners: ({ actions }) => ({
      start: async () => {
        await delay(300)
        actions.stop('hamburger')
        inc += 1
      },
    }),
  })

  const unmount = logic.mount()
  logic.actions.start()
  const { value } = await waitForAction(logic.actions.stop)
  expect(inc).toBe(1)
  expect(value).toBe('hamburger')
  unmount()
})

test('can wait for a condition', async () => {
  const logic = kea({
    actions: () => ({
      setValue: (value) => ({ value }),
      valueWasSet: (value) => ({ value }),
    }),

    listeners: ({ actions }) => ({
      setValue: async ({ value }) => {
        await delay(300)
        actions.valueWasSet(value)
      },
    }),
  })

  const unmount2 = logic.mount()
  logic.actions.setValue('cheeseburger')
  const { value } = await waitForCondition((action) => action.payload.value === 'cheeseburger')
  expect(value).toBe('cheeseburger')
  unmount2()
  expect(Array.from(getPluginContext('waitFor').conditions.values())).toEqual([])
})
