var express = require('express');
var router = express.Router();
const fetch = require('node-fetch')
const fs = require("fs");
const dateFromTimestamp = require('./utils/date');
var ca = require("../contractCA");

const Web3 = require('web3');
var infura_test = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"));
var web3 = infura_test;

var tokenAbi  = fs.readFileSync('./abi/tokenABI.json', 'utf8');
tokenAbi = JSON.parse(tokenAbi);
var tokenContract = new web3.eth.Contract(tokenAbi,ca.token);

//data encode
router.post('/inputData', (req, res) => {
    var params = req.body["params"];
    var type = req.body["type"];
    var name = req.body["name"];
    
    var inputs = [];
    for(var i = 0; i < type.length; i++){
        var obj = {
            type:type[i],
            name:"_param"+i
        };
        inputs.push(obj);
    }
    var data = web3.eth.abi.encodeFunctionCall({
        name:name,
        type:"function",
        inputs:inputs,
    },params);
    res.send(String(data));
    res.end();
    return true;
});

//data decode
router.post('/decodeData', (req,res) => {
    var type = req.body["type"];
    var data = req.body["data"];
    var decode = web3.eth.abi.decodeParameters(type,data);
    res.send(JSON.stringify(decode));
    res.end();
    return true;
})

//slot result
router.post('/recodeResult', async (req, res) => {
    var data = req.body["data"];
    const url = "http://127.0.0.1:9000/recodeResult";

    var body = JSON.stringify({data:data});
    fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:body}).then(res => res.json())
    .then(result => {
        res.send(result);
        res.end();
        return true;
    }).catch(err => {
        console.log("recodeResult-ERROR : " + err);
    })
});


router.post('/pendingGameCount', async (req,res)=>{
    var address = req.body["address"];
    address = web3.utils.toChecksumAddress(address);

    var contractAddress = ca.slotGame;
    web3.eth.getBlock("pending",(getBlock_err,getBlock)=>{
        if(!getBlock_err){
            var transactions = getBlock.transactions;
            var count = 0;
            var check = 0;
            for(var i = 0; i < transactions.length;i++){
                web3.eth.getTransaction(transactions[i],(getTx_err,getTx)=>{
                    if(getTx.to != null){
                        getTx.to = web3.utils.toChecksumAddress(getTx.to);
                        contractAddress = web3.utils.toChecksumAddress(contractAddress);
                        if(getTx.to == contractAddress){
                            if(getTx.input != null && getTx.input != undefined && getTx.input != ""){
                                var txMethod = getTx.input.substring(0,10);
                                var findMethod = web3.utils.sha3("recodeResult(address,uint256[3])").substring(0,10);
                                if(txMethod == findMethod && getTx.input.length > 74){
                                    var input_address = "0x"+getTx.input.substring(34,74);
                                    input_address = web3.utils.toChecksumAddress(String(input_address));
                                    if(address == input_address){
                                        count++;
                                    }
                                }
                            }
                        }
                    }
                    check++;
                    if(check == transactions.length){
                        res.send(String(count));
                        res.end();
                        return true;
                    }
                }).catch(err => {
                    res.send(String(0));
                    res.end();
                    return true;
                })
            }
        }else{
            console.log(getBlock_err)
        }
    })
})


//transaction Events log get
router.post('/transactionEvents', async (req,res)=>{
    var type = req.body["type"];
    var address = req.body["address"];
    address = web3.utils.toChecksumAddress(address);

    var check = 0;
    var returnArray = [];
    tokenContract.getPastEvents(type, { 
        fromBlock: 5233982,
        toBlock: 'latest'
    })
    .then(async (events) => {
        if(events.length == 0){
            res.send({tx:[]});
            res.end();
            return true;
        }
        for(var i = 0; i < events.length; i++){
            if(address == events[i].returnValues[0]){
                var obj ={
                    hash:events[i].transactionHash,
                    blockNumber:events[i].blockNumber,
                    value:web3.utils.fromWei(events[i].returnValues[1])
                }
                obj.time = await web3.eth.getBlock(events[i].blockNumber).then(getTx => { return getTx.timestamp * 1000 + (32400*1000)});
                obj.time = await dateFromTimestamp(obj.time);

                returnArray.push(obj)
                check++;
                if(check == events.length){
                    res.send({tx:returnArray});
                    res.end();
                    return true;
                }
            }else{
                check++;
                if(check == events.length){
                    res.send({tx:returnArray});
                    res.end();
                    return true;
                }
            }
        }
    }).catch(err => {
        console.log(err)
    })  
})

module.exports = router;
