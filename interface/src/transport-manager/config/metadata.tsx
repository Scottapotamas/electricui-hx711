import {
  Device,
  DiscoveryMetadataProcessor,
  DiscoveryMetadataRequester,
  FoundHint,
  Hint,
  Message,
} from '@electricui/core'

// Request and Process a 'name' for every device

class RequestName extends DiscoveryMetadataRequester {
  canRequestMetadata(device: Device) {
    return true
  }

  requestMetadata(device: Device) {
    const nameRequest = new Message('name', null)
    nameRequest.metadata.query = true
    nameRequest.metadata.internal = false

    return device
      .write(nameRequest)
      .then(res => {
        console.log('requested name, response:', res)
      })
      .catch(err => {
        console.log('Couldnt request name err:', err)
      })
  }
}

class ProcessName extends DiscoveryMetadataProcessor {
  isRelevantMessage(message: Message, device: Device) {
    // if this is an ack packet, ignore it
    if (message.metadata.ackNum > 0 && message.payload === null) {
      return false
    }

    // if it's a name packet, process it
    if (message.messageID === 'name') {
      return true
    }

    return false
  }

  processMetadata(message: Message, device: Device, foundHint: FoundHint) {
    if (message.messageID === 'name') {
      device.addMetadata({
        name: message.payload,
      })
    }
  }
}

// Request and Process 'ws' alternative connection hints

class RequestWS extends DiscoveryMetadataRequester {
  canRequestMetadata(device: Device) {
    return true // always ask
  }

  requestMetadata(device: Device) {
    const wsPathRequest = new Message('ws', null)
    wsPathRequest.metadata.query = true
    wsPathRequest.metadata.internal = false

    return device
      .write(wsPathRequest)
      .then(res => {
        console.log('requested ws, response:', res)
      })
      .catch(err => {
        console.log('Couldnt request ws err:', err)
      })
  }
}

class ProcessWS extends DiscoveryMetadataProcessor {
  isRelevantMessage(message: Message, device: Device) {
    // if this is an ack packet, ignore it
    if (message.metadata.ackNum > 0 && message.payload === null) {
      return false
    }

    // if it's a ws packet, process it
    if (message.messageID !== 'ws') {
      return false
    }

    // if it's a blank payload, don't process it
    if (message.payload === '') {
      return false
    }

    return true
  }

  processMetadata(message: Message, device: Device, foundHint: FoundHint) {
    // build the hint
    const hint = new Hint('websockets')

    // it has no identification
    hint.setConfiguration({
      uri: message.payload,
    })

    // push the hint up
    foundHint(hint)
  }
}

export { RequestWS, ProcessWS, RequestName, ProcessName }
