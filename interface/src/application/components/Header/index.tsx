import React from 'react'
import {
  Navbar,
  Button as BlueprintButton,
  Alignment,
  Divider,
} from '@blueprintjs/core'
import { RouteComponentProps } from '@reach/router'
import { navigate } from '@electricui/utility-electron'
import {
  useDeviceConnect,
  useDeviceDisconnect,
  useDeviceConnectionRequested,
} from '@electricui/components-core'
import {
  Statistic,
  Statistics,
  Button,
  Slider,
} from '@electricui/components-desktop-blueprint'
import { CALL_CALLBACK } from '@electricui/core'
interface InjectDeviceIDFromLocation {
  deviceID?: string
  '*'?: string // we get passed the path as the wildcard
}

export const Header = (
  props: RouteComponentProps & InjectDeviceIDFromLocation,
) => {
  const disconnect = useDeviceDisconnect()
  const connect = useDeviceConnect()
  const connectionRequested = useDeviceConnectionRequested()

  const page = props['*'] // we get passed the path as the wildcard, so we read it here

  return (
    <div className="device-header">
      <Navbar style={{ background: 'transparent', boxShadow: 'none' }}>
        <div style={{ margin: '0 auto', width: '100%' }}>
          <Navbar.Group align={Alignment.LEFT}>
            <BlueprintButton
              minimal
              large
              icon="home"
              text="Back"
              onClick={() => {
                navigate('/')
              }}
            />

            {connectionRequested ? (
              <BlueprintButton
                minimal
                intent="danger"
                icon="cross"
                text="Disconnect"
                onClick={() => {
                  disconnect()
                }}
              />
            ) : (
              <BlueprintButton
                minimal
                icon="link"
                intent="success"
                text="Connect again"
                onClick={() => {
                  connect()
                }}
              />
            )}
          </Navbar.Group>
          <Navbar.Group style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block' }}>
              Calibration Weight
              <Slider min={0} max={10} stepSize={0.1} labelStepSize={2.5}>
                <Slider.Handle accessor="cal_weight" />
              </Slider>
            </div>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <Button
              large
              icon="changes"
              intent="primary"
              writer={{
                tare_all: CALL_CALLBACK,
              }}
            >
              Tare All
            </Button>
            <Divider />
            <Button
              large
              icon="download"
              intent="success"
              writer={{
                save: CALL_CALLBACK,
              }}
            >
              Save Calibration
            </Button>
          </Navbar.Group>
        </div>
      </Navbar>
    </div>
  )
}
