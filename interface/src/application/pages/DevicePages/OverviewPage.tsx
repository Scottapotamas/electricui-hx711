import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { Card } from '@blueprintjs/core'
import { Grid, Cell } from 'styled-css-grid'

import { IntervalRequester } from '@electricui/components-core'
import {
  Slider,
  Button,
  Statistic,
  NumberInput,
} from '@electricui/components-desktop-blueprint'
import { Chart } from '@electricui/components-desktop-charts'

import { CALL_CALLBACK } from '@electricui/core'

export const OverviewPage = (props: RouteComponentProps) => {
  return (
    <React.Fragment>
      <IntervalRequester interval={200} variables={['load']} />
      <IntervalRequester interval={1500} variables={['kw']} />

      <Grid columns={1}>
        <Cell>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '1em' }}>
              <b>Load</b>
            </div>
            <Chart
              timeseriesKey="loads"
              duration={25000}
              delay={0}
              yMin={-10}
              yMax={10}
              height={400}
            />
          </Card>
        </Cell>
        <Grid columns={2}>
          <Cell>
            <Card>
              <Statistic accessor="load" label="Load" />
              <Button
                writer={{
                  tare: CALL_CALLBACK,
                }}
              >
                Tare
              </Button>
            </Card>
          </Cell>
          <Cell>
            <Card>
              <Button
                writer={{
                  precal: CALL_CALLBACK,
                }}
              >
                Calibration Step 1
              </Button>
              <NumberInput accessor="kw" debounceDuration={100} />
              <Button
                writer={{
                  setcal: CALL_CALLBACK,
                }}
              >
                Set Calibration Value
              </Button>
            </Card>
          </Cell>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}
