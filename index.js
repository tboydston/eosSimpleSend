const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');                                    
const { TextEncoder, TextDecoder } = require('util');                  

let cliArgs = process.argv.slice(2);
console.log('myArgs: ', cliArgs[0]);

argsJson = JSON.parse(cliArgs[0])

if ( 
	!argsJson.hasOwnProperty("privKey") ||
	!argsJson.hasOwnProperty("rpcURL") ||
	!argsJson.hasOwnProperty("from") ||
	!argsJson.hasOwnProperty("to") ||
	!argsJson.hasOwnProperty("amount") ||
	!argsJson.hasOwnProperty("memo")
	) {

	console.log( JSON.stringify({
		result:"error",
		message:"Please provide privKey, rpcURL( including port ), from, to, amount, memo"
	}) )

	process.exit()

}

let privKey = argsJson.privKey
let rpcURL = argsJson.rpcURL
let from = argsJson.from
let to = argsJson.to
let amount = argsJson.amount
let memo = argsJson.memo

const defaultPrivateKey = privKey; 
const signatureProvider = new JsSignatureProvider([defaultPrivateKey])


const rpc = new JsonRpc(rpcURL, { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

(async () => {
	try {
	  const result = await api.transact({
	    actions: [{
	      account: 'eosio.token',
	      name: 'transfer',
	      authorization: [{
	        actor: from,
	        permission: 'active',
	      }],
	      data: {
	        from: from,
	        to: to,
	        quantity: amount+' EOS',
	        memo: memo,
	      },
	    }]
	  }, {
	    blocksBehind: 3,
	    expireSeconds: 120,
	  });

		console.log( JSON.stringify({
			result:"success",
			message: JSON.stringify({result})
		}))

 	} catch (e) {

	  if (e instanceof RpcError)
	  	console.log( JSON.stringify({
			result:"success",
			message: console.log(JSON.stringify(e.json, null, 2))
		}))
	}
})();

