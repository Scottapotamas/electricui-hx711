import {
  Alignment,
  Button as BlueprintButton,
  Divider,
  Navbar,
} from '@blueprintjs/core'
import { Button, Slider } from '@electricui/components-desktop-blueprint'
import {
  useDeadline,
  useDeviceConnect,
  useDeviceConnectionRequested,
  useDeviceDisconnect,
} from '@electricui/components-core'

import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { navigate } from '@electricui/utility-electron'

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
  const getDeadline = useDeadline()

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
                  disconnect(getDeadline())
                }}
              />
            ) : (
              <BlueprintButton
                minimal
                icon="link"
                intent="success"
                text="Connect again"
                onClick={() => {
                  connect(getDeadline())
                }}
              />
            )}
          </Navbar.Group>{' '}
          <Navbar.Group style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block' }}>
              Calibration Weight
              <Slider min={0} max={10} stepSize={0.1} labelStepSize={2.5}>
                <Slider.Handle accessor="cal_weight" />
              </Slider>
            </div>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <Button large icon="changes" intent="primary" callback="tare_all">
              Tare All
            </Button>
            <Divider />
            <Button large icon="download" intent="success" callback="save">
              Save Calibration
            </Button>
          </Navbar.Group>
        </div>
      </Navbar>
    </div>
  )
}
