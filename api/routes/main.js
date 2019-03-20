var express = require('express');
var router = express.Router();
const Tx = require('ethereumjs-tx');
var ca = require("../../contractCA");
const Web3 = require('web3');
var infura_test = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"));
var web3 = infura_test;

module.exports = function(app, router)
{
	app.post('/recodeResult', (req, res) => {
    	var data = req.body["data"];
		res.header('Content-type','application/json');
		res.header('Charset','utf8');
		if(data == undefined){
			console.log("Data undefined");
			res.end();
			return true;
		}
    	const privateKey = Buffer.from('privatekey',"hex");
    	const owner = "0x2D965CE29328aFef29ee87B28A33cF5748615a5a";

    	web3.eth.getTransactionCount(owner, (err, txCount)=>{
        	const rawTx = {
            	 nonce: web3.utils.toHex(txCount),
             	gasPrice: web3.utils.toHex(web3.utils.toWei("50","gwei")),
             	gasLimit: web3.utils.toHex(150000),
             	to: ca.slotGame,
             	value: '0x00',
             	data:data 
         	}

         	const tx = new Tx(rawTx);
         	tx.sign(privateKey);
         
         	web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
         	.on('transactionHash', (txHash) => {
				console.log(txHash + " - Send")
				res.json({hash:txHash})
				res.send(JSON.stringify({hash:txHash}));
            	res.end();
            	return true;
         	});
    	})
	});
}
