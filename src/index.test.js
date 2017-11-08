// @flow
import { describe, it } from 'mocha'
import { eq } from '@briancavalier/assert'
import { take, tap, runEffects } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import { type AnimationFrameHandler, type AnimationFrameRequest, nextAnimationFrame, animationFrames } from './index'

const fakeAnimationFrames = {
  requestAnimationFrame (handler: AnimationFrameHandler): AnimationFrameRequest {
    return setTimeout(() => handler(Date.now()), 0)
  },
  cancelAnimationFrame (request: AnimationFrameRequest): void {
    return clearTimeout(request)
  }
}

const collectEvents = (stream, events = []) =>
  runEffects(tap(x => events.push(x), stream), newDefaultScheduler())
    .then(_ => events)

describe('nextAnimationFrame', () => {
  it('should produce event for next animation frame', () => {
    return collectEvents(nextAnimationFrame(fakeAnimationFrames))
      .then(events => eq(1, events.length))
  })
})

describe('animationFrames', () => {
  it('should produce event for animation frames', () => {
    return collectEvents(take(2, animationFrames(fakeAnimationFrames)))
      .then(events => eq(2, events.length))
  })

  it('should produce event for animation frames', () => {
    const n = 2 + Math.floor(Math.random() * 10)
    return collectEvents(take(n, animationFrames(fakeAnimationFrames)))
      .then(events => eq(n, events.length))
  })
})
