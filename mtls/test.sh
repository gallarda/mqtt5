#!/bin/sh

mosquitto_pub -d -h localhost -t "topic/test" -m "test123" -V mqttv5 --cafile ca.crt --cert client2.crt --key client2.key -p 8883 -i tcp-aif-station02 -u user -P pass
