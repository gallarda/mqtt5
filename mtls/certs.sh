CA_NAME=TEST_CA
CLIENT="std stationId"
cd /mtls

# Install mosquitto clients
apk add mosquitto-clients

# Create a certificate authority (CA) that both the client and server trust. The CA is just a public and private key with the public key wrapped up in a self-signed X.509 certificate.
openssl req -x509 -newkey rsa:4096 -keyout ca.key -out ca.crt -nodes -days 365 -subj "/CN=$CA_NAME/O=Client\ Certificate\ Demo"
# Inspect ...
openssl x509 -in ca.crt -text -noout


# Create the server’s key and certificate; Create a Certificate Signing Request (CSR) with the Common Name (CN) localhost
openssl req -newkey rsa:4096 -keyout server.key -out server.csr -nodes -days 365 -subj "/CN=localhost"
# Using the CSR, the CA (really using the CA key and certificate) creates the signed certificate
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 365 -out server.crt
# Inspect ...
openssl x509 -in server.crt -text -noout


# Create the client’s key and certificate; Creating the CSR with the arbitrary Common Name of client
openssl req -newkey rsa:4096 -keyout client.key -out client.csr -nodes -days 365 -subj "/CN=$CLIENT"
# Creating the client’s certificate
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 365 -out client.crt
# Inspect ...
openssl x509 -in client.crt -text -noout
