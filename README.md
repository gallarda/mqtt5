# MQTT5
**MQTTv5 Parser for NGINX JavaScript (njs)**
![MQTT Diagram](MQTTdiagram.png)

NOTE: *You must have an existing NGINX Plus Docker image tagged as `nginxplus` with the njs module installed.*

*What does this do?
---
1. Accept incoming TCP connection, decrypt TLS and perform mTLS client authentication
2. Parse Client Certificate and retrieve Subject DN
3. Parse MQTT CONNECT message (All fields are made available for logging or further processing)
4. Compare last 9 characters of Client ID in MQTT message to Subject DN in Client Certificate
5. Reject connection if they don’t match
6. Construct new MQTT CONNECT message with embedded Subject DN in “username” field
7. Proxy TCP connection with modified CONNECT message to EMQ X MQTT Brokers

*Using with Docker Compose*
---

Use `docker-compose up` to start NGINX and the EMQX MQTT Broker

The following ports will be mapped to localhost on your Docker host:

* 1883: MQTT in the clear
* 8883: MQTT over TLS
* 18083: EMQX Dashboard (admin/admin)

*Using with Visual Studio Code*
---

After cloning this repo in VS Code, you will be asked to open a devContainer.  Typescript declaration files for njs are installed to enable Intellisense and autocompletions.  You can right click on the `docker-compose.yml` file and select "Compose Down" to shutdown the containers.

Files in the workspace can be edited locally or in the container.  Just run `nginx -s reload` in a container terminal after saving a change. In Visual Studio Code, you can trigger a reload by selecting **Run Build Task** (⇧⌘B)
