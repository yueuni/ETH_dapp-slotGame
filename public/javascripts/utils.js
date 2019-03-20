$(function() {
    $('#alert').hide();
    $('#loading').hide();
});

function show(message){ //로딩창 활성화
    $("#loading").find("#warning_message").text(message);
    $("#loading").show();
}

function hide(){//로딩창 비활성화
    $('#loading').hide();
}

function alertShow(title,massage){
    $('#alert').find(".alert-heading").text(title);
    $('#alert').find("p").text(massage);
    $('#alert').show();
}

function alertHide(){
    $('#alert').hide();
}

function inputData(name,type,params){
    return new Promise((resolve,reject)=>{
        $.ajax({
            url : "/call/inputData",
            type: "post",
            data: {
                "name":name,
                "type":type,
                "params":params
            },
            dataType : "text",
            success : (data) => {
                resolve(data);
            },
            error : (ajax_err) => {
                reject(ajax_err); 
            }
        });
    })
}


