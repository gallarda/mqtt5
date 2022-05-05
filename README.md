# MQTT5
**MQTTv5 Parser for NGINX JavaScript (njs)**

NOTE: *You must have an existing NGINX Plus Docker image tagged as `nginxplus` with the njs module installed.*

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
