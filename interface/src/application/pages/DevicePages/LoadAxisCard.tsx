import { Box, Composition } from 'atomic-layout'
import {
  Button,
  Statistic,
  Statistics,
} from '@electricui/components-desktop-blueprint'
import { ButtonGroup, Card } from '@blueprintjs/core'
import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
} from '@electricui/components-desktop-charts'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'

import { CalibrationValues } from '../../../transport-manager/config/codecs'
import { MessageDataSource } from '@electricui/core-timeseries'
import React from 'react'
import { RouteComponentProps } from '@reach/router'

const loadDataSource = new MessageDataSource('load')

type LightBulbProps = {
  sensor_index: number
  graph_window_ms: number
}

export const LoadAxisCard = (props: LightBulbProps) => {
  const calibration = useHardwareState<CalibrationValues>(
    state => state.cal[props.sensor_index],
  )

  if (calibration === null) {
    return <span>No Calibration Object</span>
  }

  return (
    <Card>
      <Composition templateCols="1fr 240px">
        <Box>
          <ChartContainer>
            <LineChart
              dataSource={loadDataSource}
              accessor={state => state.load[props.sensor_index]}
              maxItems={10000}
            />
            <RealTimeDomain
              window={props.graph_window_ms}
              yMin={-8.0}
              yMax={8.0}
            />
            <TimeAxis />
            <VerticalAxis />
          </ChartContainer>
        </Box>
        <Box>
          <div style={{ textAlign: 'center', marginBottom: '1em' }}>
            <h2>Axis {props.sensor_index}</h2>
          </div>
          <div>
            <Statistics>
              <Statistic
                accessor={state => state.load[props.sensor_index]}
                label="kg"
              />
            </Statistics>
          </div>
          <br />
          <ButtonGroup>
            <Button
              writer={{
                calibrate_a: props.sensor_index,
              }}
            >
              Cal A
            </Button>
            <Button
              writer={{
                calibrate_b: props.sensor_index,
              }}
            >
              Cal B
            </Button>
          </ButtonGroup>
          <br />
          <Button
            writer={{
              tare: props.sensor_index,
            }}
          >
            Tare
          </Button>
        </Box>
      </Composition>
    </Card>
  )
}
