#curl_API.py

import requests

apikey = '5af63cd4292d370012e7f73c'
chain_name = 'TEST'
chaincode_name = 'zig-ledger'

query_url = 'https://baas.ziggurat.cn/public-api/call/{}/{}/query?apikey={}'.format(chain_name,chaincode_name,apikey)

invoke_url = 'https://baas.ziggurat.cn/public-api/call/{}/{}/invoke?apikey={}'.format(chain_name,chaincode_name,apikey)

blocks_url = 'https://baas.ziggurat.cn/public-api/chain/{}/blocks?apikey={}'.format(chain_name,apikey)
import json

import os
def query(func, params): # Tested
  query_order = " curl -X POST  -H'Content-Type: application/json'  -d "+\
                  " \'{{\"func\": \"{}\", \"params\": {} }}\' ".format(func,params)+\
                  "\'{}\'".format(query_url)
  textlist = os.popen(query_order).readlines()[0]
  return ( json.dumps(json.loads(textlist),indent = 2) )

def invoke(func, params,account): # Tested
  invoke_order = " curl -X POST  -H'Content-Type: application/json'  -d "+\
                  " \'{{\"func\": \"{}\", \"params\": {},\"account\":\"{}\"}}\' ".format(func,params,account)+\
                  "\'{}\'".format(invoke_url)
  textlist = os.popen(invoke_order).readlines()[0]
  return ( json.dumps(json.loads(textlist),indent = 2) )

def blocks(): # Tested
  blocks_order = ''' curl '{}' '''.format(blocks_url)
  print(blocks_order)
  textlist = os.popen(blocks_order).readlines()[0]
  return ( json.dumps(json.loads(textlist),indent = 2) )