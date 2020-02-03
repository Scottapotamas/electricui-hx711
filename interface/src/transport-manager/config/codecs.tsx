import { Codec, Message, PushCallback } from '@electricui/core'
import { SmartBuffer } from 'smart-buffer'

export type PinAllocations = {
  dout: number
  sck: number
}

export class PinAllocationsCodec extends Codec {
  filter(message: Message): boolean {
    return message.messageID === 'pins'
  }

  decode(
    message: Message<Buffer>,
    push: PushCallback<Message<PinAllocations[] | null>>,
  ) {
    // The null case
    if (message.payload === null) {
      return push((message as unknown) as Message<null>)
    }

    const reader = SmartBuffer.fromBuffer(message.payload)

    const pinSettings: PinAllocations[] = []

    while (reader.remaining() > 0) {
      const pinStruct: PinAllocations = {
        dout: reader.readUInt8(),
        sck: reader.readUInt8(),
      }
      pinSettings.push(pinStruct)
    }

    // Push it up the pipeline
    return push(message.setPayload(pinSettings))
  }
}

export type StorageState = {
  power_on_count: number
  storage_ok: number
  calibration_loaded: number
}

export class StorageInfoCodec extends Codec {
  filter(message: Message): boolean {
    return message.messageID === 'nvi'
  }

  decode(
    message: Message<Buffer>,
    push: PushCallback<Message<StorageState | null>>,
  ) {
    // The null case
    if (message.payload === null) {
      return push((message as unknown) as Message<null>)
    }

    const reader = SmartBuffer.fromBuffer(message.payload)

    const settings: StorageState = {
      power_on_count: reader.readUInt32LE(),
      storage_ok: reader.readUInt8(),
      calibration_loaded: reader.readUInt8(),
    }

    // Push it up the pipeline
    return push(message.setPayload(settings))
  }
}

export type CalibrationValues = {
  cal_factor: number
  crc: number
}

export class CalibrationCodec extends Codec {
  filter(message: Message): boolean {
    return message.messageID === 'cal'
  }

  // encode(message: Message<CalibrationValues[]>, push: PushCallback) {
  //   if (message.payload === null) {
  //     return push(message)
  //   }

  //   const packet = new SmartBuffer()

  //   for (const calibration of message.payload) {
  //     packet.writeInt32LE(calibration.cal_factor)
  //     packet.writeInt32LE(0) // don't write a CRC value to hardware
  //   }

  //   // Push it up the pipeline
  //   return push(message.setPayload(packet.toBuffer()))
  // }

  decode(
    message: Message<Buffer>,
    push: PushCallback<Message<CalibrationValues[] | null>>,
  ) {
    if (message.payload === null) {
      return push((message as unknown) as Message<null>)
    }

    const reader = SmartBuffer.fromBuffer(message.payload)

    const calibrations: CalibrationValues[] = []

    while (reader.remaining() > 0) {
      const calibration_value: CalibrationValues = {
        cal_factor: reader.readInt32LE(),
        crc: reader.readUInt32LE(),
      }
      calibrations.push(calibration_value)
    }

    return push(message.setPayload(calibrations))
  }
}

// Create the instances of the codecs
export const customCodecs = [
  new StorageInfoCodec(),
  new PinAllocationsCodec(),
  new CalibrationCodec(),
]
