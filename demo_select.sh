#!/bin/bash

demo_names="clientid_cn_mod|properties_routing"

print_usage() {
    json=$(curl -s http://localhost/api/7/stream/keyvals/demo)
    echo -e "\n Usage: $0 <demo_name>"
    echo -e "  Where demo_name is one of:\n"
    echo -e "    $demo_names\n" | sed -re 's/\|/\n    /g'
    echo -e " Current Setting: $json\n"
    exit 1
}

[ -z "$1" ] && print_usage
echo $demo_names | grep "${1}" > /dev/null || print_usage


curl -s http://localhost/api/7/stream/keyvals/demo | grep name > /dev/null
post=$?
if [ "$post" -eq 1 ]
then
    curl -X POST -d "{\"name\":\"$1\"}" http://localhost/api/7/stream/keyvals/demo
else
    curl -X PATCH -d "{\"name\":\"$1\"}" http://localhost/api/7/stream/keyvals/demo
fi

json=$(curl -s http://localhost/api/7/stream/keyvals/demo)
echo -e "\n New Setting: $json\n"
