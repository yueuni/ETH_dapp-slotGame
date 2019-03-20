var userAddress; //로그인 된 Address 저장

$(function(){
    //메타마스크 계정 불러오기
    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            var message = "PC 크롬을 이용해주시기 바라며, \n크롬의 확장프로그램 MetaMask를 설치해주세요.";
            alert(message);
            show(message);
            return;
        }
        if (accs.length == 0) {
            var message = "Metamask 계정을 가져올 수 없습니다.\nMetamask에 로그인 해주세요.";
            alert(message);
            show(message);
            return;
        }
        userAddress = accs.toString();
        hide();
    }).catch(err => {
        var message = "크롬을 이용해주시기 바라며, \n크롬의 확장프로그램 MetaMask를 설치해주세요.";
        console.log(err)
        alert(message);
        show(message);
        return;
    });

    //네트워크 확인
    web3.version.getNetwork((err, netId) => {
        var network;
        switch (netId){
            case "1":
                network = "Mainnet"
                break;
            case "2":
                network = "undefined";
                break;
            case "3":
                network = "Ropsten"
                break;
            case "4":
                network = "Rinkeby" 
                break;
            case "42":
                network = "Kovan"
                break;
            default:
                network = "undefined"
        }
        if(network == "undefined"){
            var message = "Metamask 연동 네트워크를 확인할 수 없습니다.\nRopsten으로 설정해주세요."
            show(message);
            alert(message);
        }else if(network != "Ropsten"){
            var message = "현재 Metamask 연동 네트워크 : "+network+"\n"+network+"을 지원하지 않습니다.\nRopsten으로 설정해주세요.";
            show(message);
            alert(message);
        }
    })
})

//토큰 잔액조회
function balanceOf(address){
    return new Promise((resolve,reject)=>{
        var tokenCA = $("#tokenCA").val();
        var data = getMethodID("balanceOf(address)");
        data += address.substring(2);
        web3.eth.call({to:tokenCA,data:data},(_err,result)=>{
            if(_err != null){
                reject(_err);
            }else{
                var result = web3._extend.utils.fromWei(result);
                resolve(result);
            }
        })
    })
}

//eth잔액조회
function getBalance(address){
    return new Promise((resolve,reject)=>{
        web3.eth.getBalance(address,(_err,result)=>{
            if(_err != null){
                reject(_err);
            }else{
                var eth = web3._extend.utils.fromWei(result);
                resolve(eth);
            }
        })
    })
}

//methodID 추출용
function getMethodID(name){
    return web3.sha3(name).substring(0,10) + "000000000000000000000000";
}

//data decode
function getDecodeData(type,data){
    $.ajax({
        url : "/call/decodeData",
        type: "post",
        data: {
            "data":data,
            "type":type
        },
        dataType : "text",
        success : (data) => {
            resolve(JSON.parse(data));
        },
        error : (ajax_err) => {
            reject(ajax_err); 
        }
    });
}

//pending 체크
function getPending(address,name,contract){
    return new Promise((resolve,reject)=>{
        var contractAddress = $("#"+contract+"CA").val();
        web3.eth.getBlock("pending",(getBlock_err,getBlock)=>{
            var transactions = getBlock.transactions;
            var count = 0;
            var check = 0;
            for(var i = 0; i < transactions.length;i++){
                web3.eth.getTransaction(transactions[i],(getTx_err,getTx)=>{
                    if(getTx.from == address && getTx.to == contractAddress){
                        if(getTx.input != null && getTx.input != undefined && getTx.input != ""){
                            var txMethod = getTx.input.substring(0,10);
                            var findMethod = web3.sha3(name).substring(0,10)
                            if(txMethod == findMethod){
                                count++;
                            }
                        }
                    }
                    check++;
                    if(check == transactions.length){
                        resolve(count);
                    }
                })
            }
        })
    })
}

//메타마스트 계정 실시간 체크
var check = false; //alert 중복 방지
var accountInterval = setInterval(() => {
    web3.eth.getAccounts(function(err, accs) {
        if (accs.toString() != userAddress && userAddress != null) {
            show();
            if(!check){
                alert("메타마스크 로그인 계정이 변경되었습니다!!\naddress : "+accs);
            }
            check = true;
            clearInterval(accountInterval);
            console.log(1)
            userAddress = accs;
            location.href="/";
        }
    })
}, 100); //accountInterval


// 잔액 출력 업데이트
var dataUpdate = setInterval(() =>{
    try{
        web3.eth.getAccounts(function(err, address) {
            $("#userAddress").text(address.toString());
            getBalance(address.toString()).then(eth => {
                $("#ETHBalance").text(eth + " ETH");
            }).catch(err => {
                var message = "PC 크롬을 이용해주시기 바라며, \n크롬의 확장프로그램 MetaMask를 설치해주세요.";
                console.log(err)
                alert(message);
                show(message);
                return;
            })
    
            balanceOf(address.toString()).then(token => {
                $("#TokenBalance").text(token + " BYC");
            }).catch(err => {
                console.log(err);
            })
        });
    }catch(err){
        if(!check){
            var message = "PC 크롬을 이용해주시기 바라며, \n크롬의 확장프로그램 MetaMask를 설치해주세요.";
            alert(message);
        }
        check = true;
        console.log(err)
        show(message);
        return;
    }
},1000);

