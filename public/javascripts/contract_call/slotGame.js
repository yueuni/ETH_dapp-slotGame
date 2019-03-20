function getPendingGame(address){
    return new Promise((resolve,reject)=>{
        $.ajax({
            url : "/call/pendingGameCount",
            type: "post",
            data: {"address":address},
            dataType : "text",
            success : (data) => {
                resolve(data)
            },
            error : (ajax_err) => {
                console.log(ajax_err) 
                reject(0)
            }
        });
    })
}

function getCoin(){
    return new Promise((resolve,reject)=>{
        var slotGameCA = $("#slotGameCA").val();
        web3.eth.getAccounts(function(err, address) {
            var data = getMethodID("getCoin(address)");
            data += address.toString().substring(2);
            web3.eth.call({to:slotGameCA,data:data},(_err,result)=>{
                if(_err != null){
                    reject(_err);
                }else{
                    result = web3._extend.utils.fromWei(result);
                    resolve(result);
                }
            })
        })
    })
}

function addCoin(){
    var slotGameCA = $("#slotGameCA").val();
    web3.eth.getAccounts(function(err, accs) {
        var balance = $("#TokenBalance").text().replace(" BYC","");
        if(balance == "0" || balance == ""){
            alert("BYC를 보유하고 있지 않습니다.\n구매창으로 이동합니다.");
            $(location).attr("href","/exchange_Token");
            return;
        }
        var value = prompt("몇 개의 토큰을 넣겠습니까?\n소숫점은 버림처리됩니다.");
        value = parseInt(value);

        if(isNaN(value)){
            alert("숫자만 입력해주세요.");
            return;
        }else if(value < 1){
            alert("1보다 작은 숫자는 입력할 수 없습니다.");
            return;
        }
        value = Math.floor(value);
        balanceOf(accs.toString()).then(balance => {
            if(balance < value){
                alert("BYC가 부족합니다.\n구매창으로 이동합니다.");
                $(location).attr("href","/exchange_Token");
                return;
            }else{
                value = web3._extend.utils.toWei(value);
                inputData("addCoin",["uint256"],[value]).then(data => {
                    web3.eth.sendTransaction({to:slotGameCA,data:data}, (err,txHash) => {
                        if(err == "Error: Error: MetaMask Tx Signature: User denied transaction signature."){
                            alert("토큰삽입을 거부하셨습니다.");
                            return;
                        }
                        var html = "<div>";
                        html += "<span>add BYC : </span>"
                        html += "<a href='#' onclick=\"javascript:window.open(\'https://ropsten.etherscan.io/tx/"+txHash+"'\)\">"+txHash+"</a>";
                        html += "</div>"
                        $("#txHash").append(html);
                    });
                    alert("Metamast를 통해 토큰삽입을 진행해주세요.");
                }).catch(err => {
                    console.log(err)
                })
            }
        }).catch(_err => {
            console.log(err);
        });
    })
}

// Slot 당첨번호
function recodeResult(){
    var luckyArray = [];
    for(var i = 1; i <= 3; i++){
        var luckyNum = $("#ring" + i).attr("class");
        luckyNum = Number(luckyNum.substring(10));
        luckyNum += 4;
        if(luckyNum > 11) luckyNum -= 12;
        luckyArray.push($("#ring"+i).find("div").eq(luckyNum).find("p").text());
    }
    if(luckyArray[0] == luckyArray[1] && luckyArray[1] == luckyArray[2]){
        setTimeout(function(){
            alertShow("!!! Congratulations !!!","\n★ 100 BYC ★\n");
        },3500);
    }else{
        setTimeout(function(){
            alertShow("","\nPlease try again\n");
        },3500);
    }
    web3.eth.getAccounts((err,address)=>{
        inputData("recodeResult",["address","uint256[3]"],[address.toString(),luckyArray]).then(data => {
            $.ajax({
                url : "/call/recodeResult",
                type: "post",
                data: {
                    "data":data
                },
                dataType : "json",
                success : (json) => {
                    var html = "<div>";
                    html += "<span>Slot spin : </span>"
                    html += "<a href='#' onclick=\"javascript:window.open(\'https://ropsten.etherscan.io/tx/"+json.hash+"'\)\">"+json.hash+"</a>";
                    html += "</div>"
                    $("#txHash").append(html);
                },
                error : (ajax_err) => {
                    console.log(ajax_err) 
                }
            });
        }).catch(_err => {
            console.log(_err)
        })
    })
}
