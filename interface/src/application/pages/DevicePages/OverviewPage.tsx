import { Box, Composition } from 'atomic-layout'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
import React, { useContext, useState } from 'react'

import { Slider as BlueprintSlider } from '@blueprintjs/core'
import { LoadAxisCard } from './LoadAxisCard'
import { MessageDataSource } from '@electricui/core-timeseries'
import { PinAllocations } from '../../../transport-manager/config/codecs'
import { RouteComponentProps } from '@reach/router'
import { Slider } from '@electricui/components-desktop-blueprint'

export const OverviewPage = (props: RouteComponentProps) => {
  const [width, setWidth] = useState(10000)

  const pins = useHardwareState<PinAllocations[]>(state => state.pins)
  if (!pins) {
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
          <Box key={index}>
            <LoadAxisCard sensor_index={index} graph_window_ms={width} />
          </Box>
        ))}
      </Composition>
    </React.Fragment>
  )
}
