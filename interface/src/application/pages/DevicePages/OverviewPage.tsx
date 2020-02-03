import { Composition, Box } from 'atomic-layout'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
import { MessageDataSource } from '@electricui/core-timeseries'
import React, { useContext, useState } from 'react'
import { RouteComponentProps } from '@reach/router'
import { Slider as BlueprintSlider } from '@blueprintjs/core'
import { LoadAxisCard } from './LoadAxisCard'
import { PinAllocations } from '../../../transport-manager/config/codecs'
import { Slider } from '@electricui/components-desktop-blueprint'

export const OverviewPage = (props: RouteComponentProps) => {
  const [width, setWidth] = useState(10000)

  const pins: PinAllocations[] | null = useHardwareState(state => state.pins)
  if (pins === null) {
    return <span>No pins</span>
  }

  return (
    <React.Fragment>
      {/* Allow for user controlled graph x-axis scaling */}
      <IntervalRequester variables={['cal']} interval={1000} />
      <Composition gap={10} autoCols="1fr" justifyContent="center">
        <Box>
          <div style={{ maxWidth: '60%' }}>
            <BlueprintSlider
              min={10 * 1000}
              max={2 * 60 * 1000}
              stepSize={1000}
              labelStepSize={10000}
              labelRenderer={val => `${Math.round(val / 1000)}s`}
              onChange={value => setWidth(value)}
              value={width}
            ></BlueprintSlider>
          </div>
        </Box>
        {pins.map((hx711, index) => (
          <Box>
            <LoadAxisCard sensor_index={index} graph_window_ms={width} />
          </Box>
        ))}
      </Composition>
    </React.Fragment>
  )
}
