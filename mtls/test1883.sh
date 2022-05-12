#!/bin/sh
mosquitto_pub -d -h localhost -t "topic/test" -m "test123" -V mqttv5 -p 1883 -i tcp-aif-station02 -u user -P pass
