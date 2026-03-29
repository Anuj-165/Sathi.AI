
export {};

declare global {
  interface Navigator {
    bluetooth: {
      requestLEScan: (options: BluetoothLEScanOptions) => Promise<BluetoothLEScan>;
      addEventListener: (
        type: "advertisementreceived",
        callback: (event: BluetoothAdvertisementEvent) => void
      ) => void;
      removeEventListener: (
        type: "advertisementreceived",
        callback: (event: BluetoothAdvertisementEvent) => void
      ) => void;
    };
  }

  interface BluetoothLEScanOptions {
    filters?: BluetoothLEScanFilter[];
    keepRepeatedDevices?: boolean;
    acceptAllAdvertisements?: boolean;
  }

  interface BluetoothLEScanFilter {
    services?: (string | number)[];
    name?: string;
    namePrefix?: string;
  }

  interface BluetoothLEScan {
    active: boolean;
    stop: () => void;
  }

  interface BluetoothAdvertisementEvent extends Event {
    device: BluetoothDevice;
    rssi: number;
    txPower: number;
    uuids: string[];
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
  }
}