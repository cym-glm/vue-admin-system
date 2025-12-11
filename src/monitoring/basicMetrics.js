export function startBasicMetrics(report = console.log) {
  if (typeof PerformanceObserver === 'undefined') return
  try {
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      if (lcp) report({ name: 'LCP', value: lcp.startTime })
    })
    lcpObs.observe({ type: 'largest-contentful-paint', buffered: true })

    let clsValue = 0
    const clsObs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) clsValue += e.value
      }
      report({ name: 'CLS', value: Number(clsValue.toFixed(3)) })
    })
    clsObs.observe({ type: 'layout-shift', buffered: true })

    const fidObs = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0]
      if (firstInput) report({ name: 'FID', value: firstInput.processingStart - firstInput.startTime })
    })
    fidObs.observe({ type: 'first-input', buffered: true })
  } catch {}
}