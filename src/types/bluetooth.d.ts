interface BluetoothDevice {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
}

interface BluetoothRemoteGATTService {
  device: BluetoothDevice
  uuid: string
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTCharacteristic {
  service: BluetoothRemoteGATTService
  uuid: string
  value?: DataView
  writeValue(value: BufferSource | ArrayBuffer): Promise<void>
  readValue(): Promise<DataView>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener(type: string, callback: EventListener): void
  removeEventListener(type: string, callback: EventListener): void
}

type BluetoothServiceUUID = string | BluetoothUUID
type BluetoothCharacteristicUUID = string | BluetoothUUID

interface BluetoothUUID {
  canonicalUUID: string
  static service(uuid: string): BluetoothServiceUUID
  static characteristic(uuid: string): BluetoothCharacteristicUUID
}

interface Navigator {
  bluetooth?: Bluetooth
}

interface Bluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>
  getAvailability(): Promise<boolean>
}

interface BluetoothRequestDeviceOptions {
  filters?: BluetoothLEScanFilter[]
  optionalServices?: BluetoothServiceUUID[]
  acceptAllDevices?: boolean
}

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[]
  name?: string
  namePrefix?: string
}

interface BluetoothUUID {
  (uuid: string): string
  service(uuid: string): BluetoothServiceUUID
  characteristic(uuid: string): BluetoothCharacteristicUUID
}

declare var BluetoothUUID: BluetoothUUID
