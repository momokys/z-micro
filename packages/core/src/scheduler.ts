export type Scheduler = (task: () => void) => void

export function createScheduler() {
  let taskQ = Promise.resolve()
  return (task: () => void) => {
    taskQ = taskQ.then(
      () =>
        new Promise((resolve) => {
          requestIdleCallback(async () => {
            await task()
            resolve()
          })
        }),
    )
  }
}
