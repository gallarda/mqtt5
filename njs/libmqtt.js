//@ts-check
/// <reference path="../node_modules/njs-types/ngx_stream_js_module.d.ts" />

export default { packetType, mqttVersion, mqttPropType, mqttProperty, reasonCode,
    getPacketType, parsePacket, parseProperties, newConnect, RejectConnection }

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

// Enumeration of MQTTv5 Property types
var mqttPropType = Object.freeze({
    BYTE1: 1,
    BYTE2: 2,
    BYTE4: 3,
    UTF8: 4,
    BINDATA: 5,
    VARINT: 6,
    UTF8PAIR: 7,
});

// Enumeration of MQTTv5 Properties
var mqttProperty = Object.freeze({
    PayloadFormat: 1,
    MessageExpInt: 2,
    ContentType: 3,
    ResponseTopic: 8,
    CorrelationData: 9,
    SubscriptionId: 11,
    SessionExpiryInt: 17,
    AssignedClientId: 18,
    ServerKeepAlive: 19,
    AuthMethod: 21,
    AuthData: 22,
    ReqProbInfo: 23,
    WillDelayInt: 24,
    ReqResInfo: 25,
    ResInfo: 26,
    ServerRef: 28,
    ReasonString: 31,
    ReceiveMax: 33,
    TopicAliasMax: 34,
    TopicAlias: 35,
    MaxQoS: 36,
    RetainAvail: 37,
    UserProperty: 38,
    MaxPacketSize: 39,
    WildSubAvail: 40,
    SubIdAvail: 41,
    SharedSubAvail: 42,
    value:  {1: "PayloadFormat", 2: "MessageExpInt", 3: "ContentType", 8: "ResponseTopic", 9: "CorrelationData",
            11: "SubscriptionId", 17: "SessionExpiryInt", 18: "AssignedClientId", 19: "ServerKeepAlive", 21: "AuthMethod",
            22: "AuthData", 23: "ReqProbInfo", 24: "WillDelayInt", 25: "ReqResInfo", 26: "ResInfo", 28: "ServerRef",
            31: "ReasonString", 33: "ReceiveMax", 34: "TopicAliasMax", 35: "TopicAlias", 36: "MaxQoS", 37: "RetainAvail",
            38: "UserProperty", 39: "MaxPacketSize", 40: "WildSubAvail", 41: "SubIdAvail", 42:"SharedSubAvail"},
    dataType: {1: mqttPropType.BYTE1, 2: mqttPropType.BYTE4, 3: mqttPropType.UTF8, 8: mqttPropType.UTF8, 9: mqttPropType.BINDATA,
            11: mqttPropType.VARINT, 17: mqttPropType.BYTE4, 18: mqttPropType.UTF8, 19: mqttPropType.BYTE2, 21: mqttPropType.UTF8,
            22: mqttPropType.BINDATA, 23: mqttPropType.BYTE1, 24: mqttPropType.BYTE4, 25: mqttPropType.BYTE1, 26: mqttPropType.UTF8,
            28: mqttPropType.UTF8, 31: mqttPropType.UTF8, 33: mqttPropType.BYTE2, 34: mqttPropType.BYTE2, 35: mqttPropType.BYTE2,
            36: mqttPropType.BYTE1, 37: mqttPropType.BYTE1, 38: mqttPropType.UTF8PAIR, 39: mqttPropType.BYTE4, 40: mqttPropType.BYTE1,
            41: mqttPropType.BYTE1, 42: mqttPropType.BYTE1 }
});

var reasonCode = Object.freeze({
    CONNACK: {
        Success:            0,
        UnspecifiedError:   128,
        MalformedPacket:    129,
        ProtocolError:      130,
        ImplSpecError:      131,
        ProtoVersionUnsp:   132,
        ClientIdInvalid:    133,
        BadUserPass:        134,
        NotAuthorized:      135,
        ServerUnavailable:  136,
        ServerBusy:         137,
        Banned:             138,
        BadAuthMethod:      140,
        TopicNameInvalid:   144,
        PacketTooLarge:     149,
        QuotaExceeded:      151,
        PayloadFmtInvalid:  153,
        RetainNotSupported: 154,
        QoSNotSupported:    155,
        UseAnotherServer:   156,
        ServerMoved:        157,
        ConnRateExceeded:   159,
    },
    PUBACK: {
        Success:            0,
        SubsNoMatch:        16,
        UnspecifiedError:   128,
        ImplSpecError:      131,
        NotAuthorized:      135,
        TopicNameInvalid:   144,
        PacketIdInUse:      145,
        QuotaExceeded:      151,
        PayloadFmtInvalid:  153,
    },
    PUBREC: {
        Success:            0,
        SubsNoMatch:        16,
        UnspecifiedError:   128,
        ImplSpecError:      131,
        NotAuthorized:      135,
        TopicNameInvalid:   144,
        PacketIdInUse:      145,
        QuotaExceeded:      151,
        PayloadFmtInvalid:  153,
    },
    PUBREL: {
        Success:            0,
        PacketIdNotFound:   146,
    },
    PUBCOMP: {
        Success:            0,
        PacketIdNotFound:   146,
    },
    SUBACK: {
        GrantedQoS0:        0,
        GrantedQoS1:        1,
        GrantedQoS2:        2,
        UnspecifiedError:   128,
        ImplSpecError:      131,
        NotAuthorized:      135,
        TopicFilterInvalid: 143,
        PacketIdInUse:      145,
        QuotaExceeded:      151,
        SharedSubsNotSpt:   158,
        SubIDNotSupported:  161,
        WildcardSubNotSpt:  162,
    },
    UNSUBACK: {
        Success:            0,
        SubsNoExist:        17,
        UnspecifiedError:   128,
        ImplSpecError:      131,
        NotAuthorized:      135,
        TopicFilterInvalid: 143,
        PacketIdInUse:      145,
    },
    DISCONNECT: {
        Normal:             0,
        DiscWithWill:        4,
        UnspecifiedError:   128,
        MalformedPacket:    129,
        ProtocolError:      130,
        ImplSpecError:      131,
        NotAuthorized:      135,
        ServerBusy:         137,
        ServerShutDown:     139,
        BadAuthMethod:      140,
        KeepAliveTimeOut:   141,
        SessionTakeOver:    142,
        TopicFilterInvalid: 143,
        TopicNameInvalid:   144,
        RecieveMaxExceeded: 147,
        TopicAliasInvalid:  148,
        PacketTooLarge:     149,
        MessageRateTooHigh: 150,
        QuotaExceeded:      151,
        AdminAction:        152,
        PayloadFmtInvalid:  153,
        RetainNotSupported: 154,
        QoSNotSupported:    155,
        UseAnotherServer:   156,
        ServerMoved:        157,
        SharedSubsNotSpt:   158,
        ConnRateExceeded:   159,
        MaxConnectTime:     160,
        SubIDNotSupported:  161,
        WildcardSubNotSpt:  162,
    },
    AUTH: {
        Success:            0,
        Continue:           24,
        ReAuthenticate:     25,
    },
    value: { 0: "Success", 1: "GrantedQoS1", 2: "GrantedQoS2", 4: "DiscWithWill", 128: "UnspecifiedError", 129: "MalformedPacket",
            130: "ProtocolError", 131: "ImplSpecError", 132: "ProtoVersionUnsp", 133: "ClientIdInvalid", 134: "BadUserPass", 135: "NotAuthorized",
            136: "ServerUnavailable", 137: "ServerBusy", 138: "Banned", 139: "ServerShutDown", 140: "BadAuthMethod", 141: "KeepAliveTimeOut",
            142: "SessionTakeOver", 143: "TopicFilterInvalid", 144: "TopicNameInvalid", 145: "PacketIdInUse", 146: "PacketIdNotFound",
            147: "RecieveMaxExceeded", 148: "TopicAliasInvalid", 149: "PacketTooLarge", 150: "MessageRateTooHigh",
            151: "QuotaExceeded", 152: "AdminAction", 153: "PayloadFmtInvalid", 154: "RetainNotSupported", 155: "QoSNotSupported",
            156: "UseAnotherServer", 157: "ServerMoved", 158: "SharedSubsNotSpt", 159: "ConnRateExceeded", 160: "MaxConnectTime",
            161: "SubIDNotSupported", 162: "WildcardSubNotSpt"
    }
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
            //s.log("Unimplemented Packet " + packetType.value[packet.type] + ", " + packet.type);
            break;
    }

    return packet;
}

/**
 * @param {NginxStreamRequest} s
 * @param {Object} packet
 * @param {Boolean} will
 **/
// Parse the properties section of a MQTT packet or will and store the details
// under packet.props or packet.connect.willProps.
function parseProperties(s, packet, will) {
    var pEnd = 0;
    var props = {
        userdata: {}
    };

    // Properties only exist in V5.
    if ( packet.version != mqttVersion.V500 ) {
        return;
    }

    // Set the offset to the start of the packet or the will properties.
    if (will && (packet.connect.willPropStart)) {
        packet.offset = packet.connect.willPropStart;
        pEnd = packet.connect.willPropStart + packet.connect.willPropLength -1;
        packet.connect.willProps = props;
    } else if (packet.propStart) {
        packet.offset = packet.propStart;
        pEnd = packet.propStart + packet.propLength -1;
        packet.props = props;
    } else {
        s.log("Warning - this packet has no properties")
        return;
    }

    while ( packet.offset < pEnd ) {
        let myType = packet.data[packet.offset++];
        let myProp = {};
        myProp.type = mqttProperty.value[myType]
        switch (mqttProperty.dataType[myType]) {
            case mqttPropType.BINDATA:
                myProp.data = cutField(packet);
                break;
            case mqttPropType.BYTE1:
                myProp.data = packet.data[packet.offset++];
                break;
            case mqttPropType.BYTE2:
                myProp.data = getInt16(packet);
                break;
            case mqttPropType.BYTE4:
                myProp.data = getInt32(packet);
                break;
            case mqttPropType.UTF8:
                myProp.data = cutField(packet);
                break;
            case mqttPropType.UTF8PAIR:
                myProp.name = cutField(packet);
                myProp.value = cutField(packet);
                myProp.data = myProp.name + "=" + myProp.value;
                break;
            case mqttPropType.VARINT:
                myProp.data = decodeLength(packet);
                break;
        }

        // Can you have duplicate properties???? Spec doesn't say???
        // Duplicates will be converted to arrays if we encounter them.
        if ( myType != mqttProperty.UserProperty ) {
            if ( mqttProperty.value[myType] in props ) {
                props[mqttProperty.value[myType]] = [ props[mqttProperty.value[myType]] ];
                props[mqttProperty.value[myType]].push( myProp.data )
            } else {
                props[mqttProperty.value[myType]] = myProp.data;
            }
        } else if ( myProp.name in props.userdata ) {
            props.userdata[myProp.name] = [ props.userdata[myProp.name] ]
            props.userdata[myProp.name].push( myProp.value );
        } else {
            props.userdata[myProp.name] = myProp.value;
        }
    }
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

/**
 * @param {number} code
 * @param {any} reason
 **/
// Send a CONNACK back to the client with the specified code (eg reasonCode.CONNACK.NotAuthorized), and optional reason.
// The reason will be sent in properties as a mqttProperty.ReasonString if provided.
function RejectConnection(code, reason) {
    let encoded;
    let newPacket;
    if ( reason.length > 0) {
        encoded = encodeProperty(mqttProperty.ReasonString, reason);
        newPacket = Buffer.from( [packetType.CONNACK <<4, encoded.length + 3, 0, code, encoded.length ] );
        newPacket = Buffer.concat([ newPacket, encoded ] );
    } else {
        newPacket = Buffer.from( [packetType.CONNACK <<4, 3, 0, code, 0 ] );
    }
    return newPacket;
}

// Internal functions


/**
 * @param {number} type
 * @param {any} data
 **/
// encode given property data into the correct type and return it as a Buffer.
function encodeProperty(type, data) {
    var typeBuffer = Buffer.alloc(1);
    typeBuffer.writeInt8(type, 0);
    var encoded = [ typeBuffer ];
    switch (mqttProperty.dataType[type]) {
        case mqttPropType.BINDATA:
            encoded.push(setField(data));
            break;
        case mqttPropType.BYTE1:
            encoded.push(data)
            break;
        case mqttPropType.BYTE2:
            encoded.push(setInt16(data));
            break;
        case mqttPropType.BYTE4:
            encoded.push(setInt32(data));
            break;
        case mqttPropType.UTF8:
            encoded.push(setField(data));
            break;
        case mqttPropType.UTF8PAIR:
            let k = setField(data[0]);
            let v = setField(data[1]);
            encoded.push(k,v);
            break;
        case mqttPropType.VARINT:
            encoded.push( Buffer.from(encodeLength(data)));
            break;
    }
    return Buffer.concat(encoded);
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

    // Skip over Properties on V5. Store the offset and length incase
    // we want to inspect or modify later
    if ( packet.version == mqttVersion.V500) {
        packet.propLength = decodeLength(packet);
        s.log("CONNECT Properties  = " + packet.propLength + " bytes");
        packet.propStart = packet.offset;
        packet.offset += packet.propLength;
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

// Zero pad one digit number
function pad(n) { return n < 10 ? '0' + n : n }

// Read the next two bytes in the buffer as a 16 bit Big Endian Integer
function getInt16(packet) {
    var value = packet.data.readInt16BE([packet.offset++]);
    packet.offset++;
    return value;
}

// Read the next 4 bytes in the buffer as a 32 bit Big Endian Integer
function getInt32(packet) {
    var value = packet.data.readInt32BE([packet.offset++]);
    packet.offset += 3;
    return value;
}

function setInt16(number) {
    var fieldBuffer = Buffer.alloc(2);
    fieldBuffer.writeInt16BE(number);
    return fieldBuffer;
}

function setInt32(number) {
    var fieldBuffer = Buffer.alloc(4);
    fieldBuffer.writeInt32BE(number);
    return fieldBuffer;
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


