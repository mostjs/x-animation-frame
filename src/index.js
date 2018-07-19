// @flow
import type { Disposable, Scheduler, Sink, Stream } from '@most/types'
import { continueWith } from '@most/core'
import { currentTime } from '@most/scheduler'
import { disposeWith } from '@most/disposable'

export type DOMHighResTimeStamp = number

export type AnimationFrameHandler = DOMHighResTimeStamp => void

export type AnimationFrameRequest = number

export type AnimationFrames = {
  requestAnimationFrame: AnimationFrameHandler => AnimationFrameRequest,
  cancelAnimationFrame: AnimationFrameRequest => void
}

export const nextAnimationFrame = (afp: AnimationFrames): Stream<DOMHighResTimeStamp> =>
  new AnimationFrame(afp)

export const animationFrames = (afp: AnimationFrames): Stream<DOMHighResTimeStamp> =>
  continueWith(() => animationFrames(afp), nextAnimationFrame(afp))

class AnimationFrame {
  afp: AnimationFrames

  constructor (afp: AnimationFrames) {
    this.afp = afp
  }

  run (sink: Sink<DOMHighResTimeStamp>, scheduler: Scheduler): Disposable {
    const propagate = timestamp => eventThenEnd(currentTime(scheduler), timestamp, sink)
    const request = this.afp.requestAnimationFrame(propagate)
    return disposeWith(request => this.afp.cancelAnimationFrame(request), request)
  }
}

const eventThenEnd = (t, x, sink) => {
  sink.event(t, x)
  sink.end(t)
}
