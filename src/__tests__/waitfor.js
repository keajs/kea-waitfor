/* global test, expect, beforeEach */
import { resetContext, kea, getPluginContext } from 'kea'

import { waitForAction, waitForCondition, waitForPlugin } from '../index'

beforeEach(() => {
  resetContext({
    plugins: [waitForPlugin]
  })
})

const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms))

test('can wait for an action', async () => {
  let inc = 0
  const logic = kea({
    actions: () => ({
      start: true,
      stop: value => ({ value })
    }),

    listeners: ({ actions }) => ({
      start: async () => {
        await delay(300)
        actions.stop('hamburger')
        inc += 1
      }
    })
  })

  const unmount = logic.mount()
  logic.actions.start()
  const { value } = await waitForAction(logic.actions.stop)
  expect(inc).toBe(1)
  expect(value).toBe('hamburger')
  unmount()
})

test('removes itself from a waiter', async () => {
  const logic = kea({
    actions: () => ({
      start: true,
      stop: value => ({ value })
    }),

    listeners: ({ actions }) => ({
      start: async () => {
        await delay(300)
        actions.stop('hamburger')
      }
    })
  })

  logic.mount()
  logic.actions.start()
  const { value } = await waitForCondition((action) => action.type === logic.actions.stop.toString())
  expect(value).toBe('hamburger')

  expect(Array.from(getPluginContext('waitFor').conditions.values())).toEqual([])
})
