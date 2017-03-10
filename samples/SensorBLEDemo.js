// Copyright (c) 2017, Intel Corporation.

// Demo code for Arduino 101/Tinytile that uses BLE to
// advertise Accelerometer and Gyroscope data to web app

var ble = require("ble");

var DEVICE_NAME = 'Arduino101';

var SensorCharacteristic = new ble.Characteristic({
    uuid: 'fc0a',
    properties: ['read', 'notify'],
    descriptors: [
        new ble.Descriptor({
            uuid: '2901',
            value: 'BMI160 Sensor'
        })
    ]
});

SensorCharacteristic._onChange = null;

SensorCharacteristic.onSubscribe = function(maxValueSize, updateValueCallback) {
    console.log("Subscribed to bmi160 sensor change");
    this._onChange = updateValueCallback;
};

SensorCharacteristic.onUnsubscribe = function() {
    console.log("Unsubscribed to bmi160 sensor change");
    this._onChange = null;
};

SensorCharacteristic.valueChange = function(isAccel, x, y, z) {
    var xval = (x * 10000) | 0;
    var yval = (y * 10000) | 0;
    var zval = (z * 10000) | 0;

    var data = new Buffer(13);
    data.writeUInt8(isAccel, 0);
    data.writeUInt32BE(xval, 1);
    data.writeUInt32BE(yval, 5);
    data.writeUInt32BE(zval, 9);

    if (this._onChange) {
        this._onChange(data);
    }
};

ble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        ble.startAdvertising(DEVICE_NAME, ['fc00'], "https://goo.gl/slMyHI");
    } else {
        if (state === 'unsupported') {
            console.log("BLE not enabled on board");
        }
        ble.stopAdvertising();
    }
});

ble.on('advertisingStart', function(error) {
    if (error) {
        console.log("Failed to advertise Physical Web URL");
        return;
    }

    ble.setServices([
        new ble.PrimaryService({
            uuid: 'fc00',
            characteristics: [
                SensorCharacteristic,
            ]
        })
    ]);

    console.log("Advertising as Physical Web device");
});

ble.on('accept', function(clientAddress) {
    console.log("Client connected: " + clientAddress);
    setTimeout(function() {
        accel.start();
        gyro.start();
    }, 2000);
});

ble.on('disconnect', function(clientAddress) {
    console.log("Client disconnected: " + clientAddress);
    accel.stop();
    gyro.stop();
});

var accel = new Accelerometer({
    frequency: 20
});

var gyro = new Gyroscope({
    frequency: 20
});

accel.onchange = function(event) {
    SensorCharacteristic.valueChange(1, event.reading.x, event.reading.y, event.reading.z);
};

gyro.onchange = function(event) {
    SensorCharacteristic.valueChange(0, event.reading.x, event.reading.y, event.reading.z);
};

accel.onerror = function(event) {
    console.log("error: " + event.error.name +
                " - " + event.error.message);
};

gyro.onerror = function(event) {
    console.log("error: " + event.error.name +
                " - " + event.error.message);
};

console.log("Sensor (Accelerometer/Gyroscope) BLE Demo...");
