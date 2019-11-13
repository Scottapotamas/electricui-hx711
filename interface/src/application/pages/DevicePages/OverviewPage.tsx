import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { Card, HTMLTable } from '@blueprintjs/core'
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
      <IntervalRequester interval={200} variables={['lA', 'lB', 'lC']} />
      <IntervalRequester interval={1500} variables={['kwA', 'kwB', 'kwC']} />

      <Grid columns={1}>
        <Cell>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '1em' }}>
              <b>Load</b>
            </div>
            <Chart
              timeseriesKey="loads"
              duration={25000}
              delay={1}
              yMin={-20}
              yMax={20}
              height={450}
            />
          </Card>
        </Cell>
        <Grid columns={3}>
          <Cell>
            <Card>
              <h2 style={{ textAlign: 'center' }}>Channel A</h2>
              <Statistic accessor="lA" label="Load" style={{ width: '100%' }} />
              <br />
              <Button
                fill
                writer={{
                  tareA: CALL_CALLBACK,
                }}
              >
                Tare
              </Button>
              <br />
              <br />
              <br />
              <HTMLTable>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Instructions</th>
                    <th>Input</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Remove loads then press calibrate</td>
                    <td>
                      <Button
                        fill
                        intent="primary"
                        writer={{
                          precalA: CALL_CALLBACK,
                        }}
                      >
                        Calibrate
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Place known weight on axis, enter in kg</td>
                    <td>
                      <div style={{ width: '200px' }}>
                        <Slider
                          min={0}
                          max={10}
                          stepSize={0.1}
                          labelStepSize={2.5}
                        >
                          <Slider.Handle accessor="kwA" />
                        </Slider>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Set calibration factors</td>
                    <td>
                      <div>
                        <Button
                          fill
                          intent="success"
                          writer={{
                            setcalA: CALL_CALLBACK,
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </HTMLTable>
            </Card>
          </Cell>
          <Cell>
            <Card>
              <h2 style={{ textAlign: 'center' }}>Channel B</h2>
              <Statistic accessor="lB" label="Load" style={{ width: '100%' }} />
              <br />
              <Button
                fill
                writer={{
                  tareB: CALL_CALLBACK,
                }}
              >
                Tare
              </Button>
              <br />
              <br />
              <br />
              <HTMLTable>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Instructions</th>
                    <th>Input</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Remove loads then press calibrate</td>
                    <td>
                      <Button
                        fill
                        intent="primary"
                        writer={{
                          precalB: CALL_CALLBACK,
                        }}
                      >
                        Calibrate
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Place known weight on axis, enter in kg</td>
                    <td>
                      <div style={{ width: '200px' }}>
                        <Slider
                          min={0}
                          max={10}
                          stepSize={0.1}
                          labelStepSize={2.5}
                        >
                          <Slider.Handle accessor="kwB" />
                        </Slider>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Set calibration factors</td>
                    <td>
                      <div>
                        <Button
                          fill
                          intent="success"
                          writer={{
                            setcalB: CALL_CALLBACK,
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </HTMLTable>
            </Card>
          </Cell>
          <Cell>
            <Card>
              <h2 style={{ textAlign: 'center' }}>Channel C</h2>
              <Statistic accessor="lC" label="Load" style={{ width: '100%' }} />
              <br />
              <Button
                fill
                writer={{
                  tareC: CALL_CALLBACK,
                }}
              >
                Tare
              </Button>
              <br />
              <br />
              <br />
              <HTMLTable>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Instructions</th>
                    <th>Input</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Remove loads then press calibrate</td>
                    <td>
                      <Button
                        fill
                        intent="primary"
                        writer={{
                          precalC: CALL_CALLBACK,
                        }}
                      >
                        Calibrate
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Place known weight on axis, enter in kg</td>
                    <td>
                      <div style={{ width: '200px' }}>
                        <Slider
                          min={0}
                          max={10}
                          stepSize={0.1}
                          labelStepSize={2.5}
                        >
                          <Slider.Handle accessor="kwC" />
                        </Slider>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Set calibration factors</td>
                    <td>
                      <div>
                        <Button
                          fill
                          intent="success"
                          writer={{
                            setcalC: CALL_CALLBACK,
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </HTMLTable>
            </Card>
          </Cell>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}
