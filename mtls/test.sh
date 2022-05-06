#!/bin/sh

mosquitto_pub -d -h localhost -t "topic/test" -m "test123" -V mqttv5 --cafile ca.crt --cert client.crt --key client.key -p 8883 -i tcp-aif-stationId -u user -P pass
