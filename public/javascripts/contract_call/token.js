//토큰구매
function buyToken(){
    var tokenCA = $("#tokenCA").val();
    var eth = $("#buyAmount").val();
    if(eth == "" || eth == undefined){
        alert("구입할 갯수를 입력해주세요.");
        return;
    }else if(Number(eth) == 0){
        alert("0보다 큰 숫자를 입력해주세요.")
        return;
    }
    web3.eth.getAccounts(function(err, accs) {
        getBalance(accs.toString()).then(balance => {
            if(Number(balance) < Number(eth)){
                alert("ETH가 부족합니다.");
                return;
            }else{
                eth = web3._extend.utils.toWei(eth);
                var methodID = getMethodID("buyToken()");
                web3.eth.sendTransaction({to:tokenCA,value:Number(eth),data:methodID}, (err,txHash) => {
                    if(err == "Error: Error: MetaMask Tx Signature: User denied transaction signature."){
                        alert("구입을 거부하셨습니다.");
                        return;
                    }
                    var html = "<a href='#' onclick=\"javascript:window.open(\'https://ropsten.etherscan.io/tx/"+txHash+"'\)\">"+txHash+"</a>";
                    $("#buyTx").append(html);
                });
                alert("Metamast를 통해 구입을 진행해주세요.");
                $("#buyAmount").val("");
            }
        }).catch(_err => {
            console.log(err);
        });
    })
}

//토큰판매
function sellToken(){
    var tokenCA = $("#tokenCA").val();
    var byc = $("#sellAmount").val();
    if(byc == "" || byc == undefined){
        alert("판매할 갯수를 입력해주세요.");
        return;
    }else if(Number(byc) == 0){
        alert("0보다 큰 숫자를 입력해주세요.")
        return;
    }
    web3.eth.getAccounts(function(err, accs) {
        balanceOf(accs.toString()).then(balance => {
            if(Number(balance) < Number(byc)){
                alert("BYC가 잔액이 충분하지 않습니다.");
                return;
            }else{
                byc = web3._extend.utils.toWei(byc);
                inputData("sellToken",["uint256"],[byc]).then(data => {
                    web3.eth.sendTransaction({to:tokenCA,data:data}, (err,txHash) => {
                        if(err == "Error: Error: MetaMask Tx Signature: User denied transaction signature."){
                            alert("판매를 거부하셨습니다.");
                            return;
                        }
                        var html = "<a href='#' onclick=\"javascript:window.open(\'https://ropsten.etherscan.io/tx/"+txHash+"'\)\">"+txHash+"</a>";
                        $("#sellTx").append(html);
                    });
                    alert("Metamast를 통해 판매를 진행해주세요.");
                    $("#sellAmount").val("");
                }).catch(_err => {
                    console.log(_err);
                })
            }
        }).catch(_err => {
            console.log(err);
        });
    })
}

//토큰전송
function transferToken(){
    var tokenCA = $("#tokenCA").val();
    var to = $("#toAddress").val();
    var byc = $("#transferAmount").val();
    if(to == "" || to == undefined){
        alert("BTC를 받는주소를 입력해주세요.");
        return;
    }else if(!web3.isAddress(to)){
        alert("유효하지 않는 주소입니다.")
        return;
    }

    if(byc == "" || byc == undefined){
        alert("전송할 갯수를 입력해주세요.");
        return;
    }else if(Number(byc) == 0){
        alert("0보다 큰 숫자를 입력해주세요.")
        return;
    }

    web3.eth.getAccounts(function(err, accs) {
        balanceOf(accs.toString()).then(balance => {
            if(balance < byc){
                alert("BYC가 부족합니다.");
                return;
            }else{
                byc = web3._extend.utils.toWei(byc);
                inputData("transfer",["address","uint256"],[to,byc]).then(data => {
                    web3.eth.sendTransaction({to:tokenCA,data:data}, (err,txHash) => {
                        if(err == "Error: Error: MetaMask Tx Signature: User denied transaction signature."){
                            alert("전송을 거부하셨습니다.");
                            return;
                        }
                        var html = "<a href='#' onclick=\"javascript:window.open(\'https://ropsten.etherscan.io/tx/"+txHash+"'\)\">"+txHash+"</a>";
                        $("#transferTx").append(html);
                    });
                    alert("Metamast를 통해 전송을 진행해주세요.");
                    $("#transferAmount").val("");
                }).catch(_err => {
                    console.log(_err);
                })
            }
        }).catch(_err => {
            console.log(err);
        });
    })
}



