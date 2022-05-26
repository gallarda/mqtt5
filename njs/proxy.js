import mqtt from "libmqtt.js";

//@ts-check
/// <reference path="../node_modules/njs-types/ngx_stream_js_module.d.ts" />

// Global variables
var clientID = "";
var client_messages = 1;

/**
 * @param {NginxStreamRequest} s
 **/
// Modify MQTT message with js_filter()
function filterMQTT(s) {
    // Main loop to process inbound packets
    s.on('upstream', function (data, flags) {

        var packet = {};
        if (data.length == 0) {  // Initial calls may contain no data, so
            s.log("No buffer yet"); // ask that we get called again
            return;
        } else {
            packet = mqtt.parsePacket(s, data);
        }

        if (client_messages == 1) {
            if (packet.type = mqtt.packetType.CONNECT) { // CONNECT is first packet from the client

                s.log("MQTT packet type+flags = " + packet.typeFlags);

                // @ts-ignore
                s.variables.clientid = packet.connect.clientID;

                // track clientID across packets.
                clientID = packet.connect.clientID;

                // @ts-ignore
                s.variables.username = packet.connect.username;

                // @ts-ignore
                if (s.variables.filter_connect_ssl_dn == 1) {

                    // Get Subject DN from client SSL cert
                    s.log("Subject DN value = " + s.variables.ssl_client_s_dn);

                    // Compare to MQTT client ID and reject connection if they don't match
                    if (packet.connect.clientID.substr(-9) != s.variables.ssl_client_s_dn.substr(-9)) {
                        s.log("ACCESS DENIED: ClientId/Subject Mismatch");
                        throw new Error("Connection Rejected");
                    }

                    // Add a "username" field or overwrite existing
                    packet.connect.flags |= 128;  // Bit 7
                    packet.connect.username = s.variables.ssl_client_s_dn;
                    // @ts-ignore
                    s.variables.username = packet.connect.username; // Share this variable with NGINX for logging

                    // Remove "password" field if desired
                    packet.connect.flags &= ~64;  // Bit 6

                    // Create and send new CONNECT Message
                    var newMsg = mqtt.newConnect(packet);
                    s.send(newMsg, flags);
                } else {
                    s.send(data, flags);
                }
                // @ts-ignore
                if (s.variables.filter_all == 0) {
                    s.log("Disabling message processing");
                    s.off('upstream');
                    s.allow();
                }

            } else {
                s.log("ABORT: Received unexpected MQTT packet type+flags: " + packet.typeFlags.toString());
                throw new Error("Connection Rejected");
            }
        } else { // Continue processing messages from clients when s.variables.filter_all == 1
            s.log("MQTT packet: " + clientID + "(" + client_messages + ") type+flags = " + mqtt.packetType.value[packet.type]);
            s.send(data, flags);
        }
        client_messages++;
    });
}

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

export default { filterMQTT, prereadMQTT }

