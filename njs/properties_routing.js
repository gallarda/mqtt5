import mqtt from "libmqtt.js";

//@ts-check
/// <reference path="../node_modules/njs-types/ngx_stream_js_module.d.ts" />

// Global variables
var clientID = "";
var client_messages = 1;

// Parse MQTT with js_preread()
function prereadMQTT(s) {

    // Main loop to process inbound packets
    s.on('upstream', function (data, flags) {
        
        var packet = {};
        if (data.length == 0) {  // Initial calls may contain no data, so
            s.log("No buffer yet"); // ask that we get called again
            return;
        } else {
            packet = mqtt.parsePacket(s, data);
        }

        if (client_messages == 1) { // CONNECT is first packet from the client

            s.log("MQTT packet type+flags = " + packet.typeFlags.toString(2));

            // CONNECT packet sets bit 5, upper 4 bits (00010000 to 00011111) reserved
            if (packet.type = mqtt.packetType.CONNECT) {

                // Copy njs variables to NGINX variables
                // @ts-ignore
                s.variables.clientid = packet.connect.clientID;
                // @ts-ignore
                s.variables.username = packet.connect.username;

                mqtt.parseProperties(s, packet, false);
                s.log( "Properties: " + JSON.stringify( packet.props ));

                if ( packet.version != mqtt.mqttVersion.V500 ) {
                    s.log("ACCESS DENIED: Invalid MQTT Version");
                    s.deny();
                    throw new Error("Connection Rejected");
                }

                s.variables.propver = (packet.props.userdata.sw_version ? packet.props.userdata.sw_version : "-");

                s.off('upstream');

            } else {
                s.log("Received unexpected MQTT packet type+flags: " + packet.typeFlags.toString());
                throw new Error("Connection Rejected");
            }
        }
        client_messages++;
        s.allow();
    });
}

function filterMQTT(s) {
    if ( s.variables.upstream_servers == "REJECT" ) {
        s.on('downstream', function (data, flags) {
            let reject = mqtt.RejectConnection(mqtt.reasonCode.CONNACK.NotAuthorized, "Unsupported Software Version");
            s.log("Rejecting Connection: " + reject.toString('hex'));
            s.send(reject, { "last": true, "flush": true });
            s.done();
        });
    }
}

export default { prereadMQTT, filterMQTT }

