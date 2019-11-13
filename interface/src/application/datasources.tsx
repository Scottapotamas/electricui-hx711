import { DeviceID } from '@electricui/core'

import { TimeSeriesFactory, DataSource } from '@electricui/core-timeseries'

/**
 * sourceFactory takes events from the device and turns them into 'data sources'. They are essentially component accessors that happen on the event stream.
 */
export function sourceFactory(device: DeviceID): DataSource[] {
  return [
    /**
     * The load cell values
     */
    new DataSource({
      name: 'lA',
    }),
    new DataSource({
      name: 'lB',
    }),
    new DataSource({
      name: 'lC',
    }),
  ]
}

export function timeseriesFactories(device: DeviceID): TimeSeriesFactory[] {
  return [new TimeSeriesFactory('loads', ['lA', 'lB', 'lC'])]
}
