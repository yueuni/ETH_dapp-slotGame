var express = require('express');
var router = express.Router();
var ca = require("../contractCA");
const dateFromTimestamp = require('./utils/date');
const fs = require("fs");
const Web3 = require('web3');
var infura_test = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"));
var web3 = infura_test;


var slotGameAbi  = fs.readFileSync('./abi/slotGameABI.json', 'utf8');
slotGameAbi = JSON.parse(slotGameAbi);
var slotGameContract = new web3.eth.Contract(slotGameAbi,ca.slotGame);

/* GET home page. */
router.get('/', function(req, res) {
    res.render('main', { title: 'Slot Game' ,navThema:["03","navbar-light bg-light"],ca:ca});
});

router.get("/exchange_Token", function(req, res){
    res.render("exchange_Token",{title:"Token Exchange",navThema:["01","navbar-dark bg-primary"],ca:ca});
})

router.get("/LuckyMember_List", function(req, res){
    slotGameContract.getPastEvents("TheLuckyMember",{
        fromBlock: 5233982,
        toBlock : "latest"
    }).then(async (events) => {
        for(var i = 0; i < events.length; i++){
            events[i].timestamp = await web3.eth.getBlock(events[i].blockNumber).then(getTx => { return getTx.timestamp * 1000 + (32400*1000)});
            events[i].timestamp = await dateFromTimestamp(events[i].timestamp);
        }
        res.render("luckyMember_List",{title:"Lucky Member List",navThema:["01","navbar-dark bg-primary"],ca:ca,events:events});
    })
})

router.get("/about", function(req, res){
    res.render("about",{title:"Lucky Member List",navThema:["01","navbar-dark bg-primary"],ca:ca})
})



module.exports = router;
