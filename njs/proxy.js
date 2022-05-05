//@ts-check
/// <reference path="../node_modules/njs-types/ngx_stream_js_module.d.ts" />

// Global variables

// Variables parsed from MQTT message.
var packetTypeFlags = 0;
var clientID = "-";
var connectFlags = 0;
var username = "";
var password = "";

// Keep track of how many messages we get
var client_messages = 1;

// These are pointers into the buffer containing the MQTT message
var offset = 0;
var varHeaderStart = 0;
var varHeaderEnd = 0;

/**
 * @param {NginxStreamRequest} s
 **/
// Modify MQTT message with js_filter()
function filterMQTT(s) {
    // Main loop to process inbound packets
    s.on('upstream', function (data, flags) {
        if (data.length == 0) {  // Initial calls may contain no data, so
            s.log("No buffer yet"); // ask that we get called again
            return;

        } else if (client_messages == 1) { // CONNECT is first packet from the client

            packetTypeFlags = data[offset++];
            s.log("MQTT packet type+flags = " + packetTypeFlags.toString(2));

            // CONNECT packet is 1, using upper 4 bits (00010000 to 00011111)
            if (packetTypeFlags >= 16 && packetTypeFlags < 32) {

                // Parse incoming CONNECT message from client
                parseConnect(s, data);
                // @ts-ignore
                s.variables.clientid = clientID;
                // @ts-ignore
                s.variables.username = username;

                // Get Subject DN from client SSL cert
                s.log("Subject DN value = " + s.variables.ssl_client_s_dn);

                // Compare to MQTT client ID and reject connection if they don't match
                if (clientID.substr(-9) != s.variables.ssl_client_s_dn.substr(-9)) {
                    s.log("ACCESS DENIED: ClientId/Subject Mismatch");
                    throw new Error("Connection Rejected");
                }

                // Add a "username" field or overwrite existing
                connectFlags |= 128;  // Bit 7
                username = s.variables.ssl_client_s_dn;
                // @ts-ignore
                s.variables.username = username;


                // Remove "password" field if desired
                connectFlags &= ~64;  // Bit 6

                // Create and send new CONNECT Message
                var newMsg = newConnect(data);
                s.send(newMsg, flags);
                s.off('upstream');

            } else {
                s.log("ABORT: Received unexpected MQTT packet type+flags: " + packetTypeFlags.toString());
                throw new Error("Connection Rejected");
            }
        }
        client_messages++;
        s.allow();
    });
}

// Parse MQTT with js_preread()
function prereadMQTT(s) {
    // Main loop to process inbound packets
    s.on('upstream', function (data, flags) {
        if (data.length == 0) {  // Initial calls may contain no data, so
            s.log("No buffer yet"); // ask that we get called again
            return;

        } else if (client_messages == 1) { // CONNECT is first packet from the client

            packetTypeFlags = data[offset++];
            s.log("MQTT packet type+flags = " + packetTypeFlags.toString(2));

            // CONNECT packet sets bit 5, upper 4 bits (00010000 to 00011111) reserved
            if (packetTypeFlags >= 16 && packetTypeFlags < 32) {

                // Parse incoming CONNECT message from client
                parseConnect(s, data);

                // Copy njs variables to NGINX variables
                // @ts-ignore
                s.variables.clientid = clientID;
                // @ts-ignore
                s.variables.username = username;

                s.off('upstream');

            } else {
                s.log("Received unexpected MQTT packet type+flags: " + packetTypeFlags.toString());
                throw new Error("Connection Rejected");
            }
        }
        client_messages++;
        s.allow();
    });
}

// Internal functions

// Zero pad one digit number
function pad(n) { return n < 10 ? '0' + n : n }

// Read the next two bytes in the buffer as a 16 bit Big Endian Integer
function getInt16(data) {
    var value = data.readInt16BE([offset++]);
    offset++;
    return value;
}

// Generate variable byte integer
function encodeLength(length) {
    var encodedByte = 0;
    var vbi = "";
    do {
        encodedByte = length % 128;
        length = ~~(length / 128);
        // if there are more data to encode, set the top bit of this byte
        if (length > 0) {
            encodedByte = encodedByte | 128;
        }
        vbi += pad(encodedByte.toString(16));
    } while (length > 0);
    return vbi;
}

// Decode variable byte integer
function decodeLength(data) {
    var multiplier = 1;
    var value = 0;
    var encodedByte;
    do {
        encodedByte = data[offset];
        value += (encodedByte & 127) * multiplier;
        if (multiplier > 128 * 128 * 128) {
            throw new Error("Malformed Variable Byte Integer");
        }
        multiplier *= 128;
    } while ((data[offset++] & 128) != 0);
    return value;
}

// Extract Field from buffer based on length defined by 2-byte encoding
function cutField(data) {
    var length = getInt16(data);
    var fieldValue = data.toString('utf8', offset, offset + length);
    offset += length;
    return fieldValue;
}

// Create a buffer for a field and prepend its 2-byte encoded length
function setField(fieldValue) {
    var length = Buffer.byteLength(fieldValue);
    var fieldBuffer = Buffer.alloc(length + 2);
    fieldBuffer.writeInt16BE(length);
    fieldBuffer.write(fieldValue, 2);
    return fieldBuffer;
}

// Create a new CONNECT message based on modified fields
function newConnect(data) {
    var newHeader = data.subarray(varHeaderStart, varHeaderEnd);
    var newLength = newHeader.length;
    var newFields = [newHeader];

    // 
    if (connectFlags & 128) {
        var userBuf = setField(username);
        newLength += userBuf.length;
        newFields.push(userBuf);
    }

    if (connectFlags & 64) {
        var passBuf = setField(password);
        newLength += passBuf.length;
        newFields.push(passBuf);
    }

    newFields.unshift(Buffer.from(setField("MQTT").toString('hex') + "05" + connectFlags.toString(16), 'hex'));
    newLength += 8;

    newFields.unshift(Buffer.from(packetTypeFlags.toString(16) + encodeLength(newLength), 'hex'));

    return Buffer.concat(newFields);
}

// parse MQTT CONNECT packet
function parseConnect(s, data) {

    // Length of Variable Header plus length of the Payload.
    var remainingLength = decodeLength(data);
    var expectedLength = remainingLength + offset;

    s.log("Payload Length = " + remainingLength);

    // Verify protocol name and version
    // Abort if not MQTTv5
    if (cutField(data) != "MQTT" || data[offset++] != 5) {
        s.log("ABORT: Packet not MQTTv5");
        throw new Error("Connection Rejected");
    }

    // Retrieve Connect Flags and Keep Alive
    connectFlags = data[offset++];
    s.log("Connect Flags = " + connectFlags.toString(2));

    if (connectFlags & 2) s.log("Clean Start flag is set");

    varHeaderStart = offset;

    s.log("Keep Alive = " + getInt16(data));

    // Skip over CONNECT Properties
    var propLength = decodeLength(data);
    s.log("CONNECT Properties  = " + propLength + " bytes");
    offset += propLength;

    // Get Client Identifier
    clientID = cutField(data);
    s.log("ClientId value   = " + clientID);

    // Skip Will Message
    if (connectFlags & 4) {
        propLength = decodeLength(data);
        s.log("Will Properties  = " + propLength + " bytes");
        offset += propLength;

        // Make these variables global to share with NGINX
        var willTopic = cutField(data);
        s.log("Will Topic = " + willTopic);

        var willMsg = cutField(data);
        s.log("Will Payload = " + willMsg);
    }

    varHeaderEnd = offset;

    // Look for existing username/password
    if (connectFlags & 128) {
        s.log("Client User Name = " + cutField(data));
    }

    if (connectFlags & 64) {
        password = cutField(data);
        s.log("Client Password = " + password);
    }
    s.log("Expected length: " + expectedLength + " Parsed Length: " + offset);
}

export default { filterMQTT, prereadMQTT }

