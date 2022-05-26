//@ts-check
/// <reference path="../node_modules/njs-types/ngx_stream_js_module.d.ts" />

export default { packetType, getPacketType, parsePacket, newConnect }

// Enumeration of MQTT Control packets. Correct for v5, but type 15 is reserved in v3.1.1
var packetType = Object.freeze({
    CONNECT: 1,
    CONNACK: 2,
    PUBLISH: 3,
    PUBACK: 4,
    PUBREC: 5,
    PUBREL: 6,
    PUBCOMP: 7,
    SUBSCRIBE: 8,
    SUBACK: 9,
    UNSUBSCRIBE: 10,
    UNSUBACK: 11,
    PING: 12,
    PINGRES: 13,
    DISCONNECT: 14,
    AUTH: 15,
    value: {1: "CONNECT", 2: "CONNACK", 3: "PUBLISH", 4: "PUBACK", 5: "PUBREC", 6: "PUBREL",
            7: "PUBCOMP", 8: "SUBSCRIBE", 9: "SUBACK", 10: "UNSUBSCRIBE", 11: "UNSUBACK",
            12: "PING", 13: "PINGRES", 14: "DISCONNECT", 15: "AUTH" }
} );

// Enumeration of MQTT versions. Supported versions are 3.1.1 and 5.0
var mqttVersion = Object.freeze({
    V500: 5,
    V311: 4,
    V310: 3,
    value: {3: "V310", 4: "V311", 5: "V500"},
    support: {3: true, 4: true, 5: true} 
});

/**
 * @param {Object} packet
 **/
// Get the Packet Type
function getPacketType(packet) {
    packet.type = packet.typeFlags >>4
    packet.flags = packet.typeFlags &15
    if ( packet.type == packetType.PUBLISH) {
        packet.ret = packet.flags & 1
        packet.qos = packet.flags >> 1 & 3
        packet.dup = packet.flags >> 3 & 1
    }
}

/**
 * @param {NginxStreamRequest} s
 * @param {Buffer} data
 **/
// parse MQTT packet
function parsePacket(s, data) {

    var packet = {
        data: data,
        offset: 0,
        typeFlags: 0,
        type: 0,
        flags: 0,
        ret: 0,
        qos: 0,
        dup: 0,
        verString: "",
        version: 0,
        payloadLength: 0,
        length: 0
    };

    // Get Type and Flags on packet
    packet.typeFlags = data[packet.offset++];
    getPacketType(packet);

    // Length of Variable Header plus length of the Payload.
    packet.payloadLength = decodeLength(packet);
    packet.length = packet.payloadLength + packet.offset; 

    switch (packet.type) {
        case packetType.CONNECT:
            parseConnect(s, packet)
            break;
        default:
            s.log("Unimplemented Packet " + packetType.value[packet.type] + ", " + packet.type);
            break;
    }

    return packet;
}

/**
 * @param {NginxStreamRequest} s
 * @param {Object} packet
 **/
// parse MQTT Connect packet
function parseConnect(s, packet) {

    s.log("Connect Packet Length = " + packet.payloadLength);

    // Verify protocol name and store version
    // Abort if not MQTT Connect
    packet.verString = cutField(packet);
    packet.version = packet.data[packet.offset++]
    if ( (packet.verString != "MQTT") && (packet.verString != "MQIsdp")  ) {
        s.log("ABORT: Packet not MQTT");
        throw new Error("Connection Rejected");
    }

    // Reject unsupported versions here.
    if ( mqttVersion.support[packet.version] != true ) {
        s.log("ABORT: Packet version not supported: " + packet.verString + " " + mqttVersion.value[packet.version]);
        throw new Error("Connection Rejected");
    }
    s.log("Connect Accepted: " + packet.verString + " " + mqttVersion.value[packet.version]);

    // Retrieve Connect Flags and Keep Alive
    packet.connect = {
        flags: packet.data[packet.offset++]
    };

    s.log("Connect Flags = " + packet.connect.flags.toString(2));

    if (packet.connect.flags & 2) s.log("Clean Start flag is set");

    packet.connect.varHeaderStart = packet.offset;

    s.log("Keep Alive = " + getInt16(packet));

    // Skip over CONNECT Properties on V5. Store the offset and length incase
    // we want to inspect or modify later
    if ( packet.version == mqttVersion.V500) {
        packet.connect.propLength = decodeLength(packet);
        s.log("CONNECT Properties  = " + packet.connect.propLength + " bytes");
        packet.connect.propStart = packet.offset;
        packet.offset += packet.connect.propLength;
    }
    
    // Get Client Identifier
    packet.connect.clientID = cutField(packet);
    s.log("ClientId value   = " + packet.connect.clientID);

    // Store Will Message
    if (packet.connect.flags & 4) {

        // Skip over will properties, but store offset and length for later
        if (packet.version == mqttVersion.V500) {
            packet.connect.willPropLength = decodeLength(packet);
            s.log("Will Properties  = " + packet.connect.willPropLength + " bytes");
            packet.connect.willPropStart = packet.offset;
            packet.offset += packet.connect.willPropLength;
        }

        // Make these variables global to share with NGINX
        packet.connect.willTopic = cutField(packet);
        s.log("Will Topic = " + packet.connect.willTopic);

        packet.connect.willMsg = cutField(packet);
        s.log("Will Payload = " + packet.connect.willMsg);
    }

    // End of variable section. Store locations for user/password overwrite use-cases
    packet.connect.varHeaderEnd = packet.offset;

    // Look for existing username/password
    if (packet.connect.flags & 128) {
        packet.connect.username = cutField(packet);
        s.log("Client User Name = " + packet.connect.username);
    }

    if (packet.connect.flags & 64) {
        packet.connect.password = cutField(packet);
        s.log("Client Password = " + packet.connect.password);
    }
    s.log("Expected length: " + packet.length + " Parsed Length: " + packet.offset);
}

// Create a new CONNECT message based on modified user/password fields
function newConnect(packet) {
    var newHeader = packet.data.subarray(packet.connect.varHeaderStart, packet.connect.varHeaderEnd);
    var newLength = newHeader.length;
    var newFields = [newHeader];

    if (packet.connect.flags & 128) {
        var userBuf = setField(packet.connect.username);
        newLength += userBuf.length;
        newFields.push(userBuf);
    }

    if (packet.connect.flags & 64) {
        var passBuf = setField(packet.connect.password);
        newLength += passBuf.length;
        newFields.push(passBuf);
    }

    var verBuf = Buffer.from(setField(packet.verString).toString('hex') + pad(packet.version) + packet.connect.flags.toString(16), 'hex')
    newFields.unshift(verBuf);
    newLength += verBuf.length;

    newFields.unshift(Buffer.from(packet.typeFlags.toString(16) + encodeLength(newLength), 'hex'));

    return Buffer.concat(newFields);
}

// Internal functions

// Zero pad one digit number
function pad(n) { return n < 10 ? '0' + n : n }

// Read the next two bytes in the buffer as a 16 bit Big Endian Integer
function getInt16(packet) {
    var value = packet.data.readInt16BE([packet.offset++]);
    packet.offset++;
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
function decodeLength(packet) {
    var multiplier = 1;
    var value = 0;
    var encodedByte;
    do {
        encodedByte = packet.data[packet.offset];
        value += (encodedByte & 127) * multiplier;
        if (multiplier > 128 * 128 * 128) {
            throw new Error("Malformed Variable Byte Integer");
        }
        multiplier *= 128;
    } while ((packet.data[packet.offset++] & 128) != 0);
    return value;
}

/**
 * @param {Object} packet
 **/
// Extract Field from buffer based on length defined by 2-byte encoding
function cutField(packet) {
    var length = getInt16(packet);
    var fieldValue = packet.data.toString('utf8', packet.offset, packet.offset + length);
    packet.offset += length;
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


