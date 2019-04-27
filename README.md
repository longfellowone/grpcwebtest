## gRPC-Web ReactJS client, Golang Server

Follow steps below to start client and server. Run these commands in the root directory.

## Notes

If you regenerate the gRPC-Web proto files you will need to add /\* eslint-disable \*/ to the top of helloworld_pb.js

### `docker-compose up -d`

To start the envoy proxy (required for gRPC-web)

### `go run go/main.go`

To run the Golang web server

### `npm i`

To download required node_modules

### `npm start`

To start the ReactJS client
