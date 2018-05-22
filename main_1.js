$(document).ready(function() {
    console.log( "window ready" );
    $.ajaxSetup({ contentType: "application/json; charset=utf-8", });
    
    var listEmail= [];
    var listID = [];
    var msgRecipient = [];

    var tblEmployee = {
        get: function(callback) {
            $.ajax({
                type: "GET",
                url: "http://localhost:8080/employees",
                dataType: "json",
                context: this,
                success: function (response) {
                    callback.call(this, response);
                }
            });
        }
};
    //Employee display table.
    $('#displayEmp').puidatatable({
        caption: "",
        paginator: {
            rows: 10,
            totalRecords: 24
        },
        columns: [
            {field: "id", headerText: "ID", filter: true, 
                content: function(rowData) { 
                 console.log(rowData.id);
                 listID.push(rowData.id.toString());
                return rowData.id;
                }},
            {field: "lastname", headerText: "Last Name", filter: true},
            {field: "firstname", headerText: "First Name", filter: true},
            {field: "email", headerText: "Email", filter: true,  
                content: function(rowData) { 
                       // console.log(rowData.email);
                        listEmail.push(rowData.email);
                return rowData.email;
                }}
        ],
        globalFilter:'#empSearch',
        datasource: tblEmployee.get
    });    
    
    //Send to Autocomplete.
    $('#inputTo').puiautocomplete({
        completeSource: listID,
        multiple: true,
        select: function(event, item) {
            
            msgRecipient.push(item.text());
            console.log(msgRecipient); 
          }
    });


    //Submit form?
    $( '.btnSubmit' ).click(function() {
        //create prompt message when employee is saved.
        var data = {firstname: "", lastname:"", email:""};
        var elements = $( "form" ).serializeArray();
        
        data['lastname'] = elements[0].value;
        data['firstname'] = elements[1].value;
        data['email'] = elements[2].value;

        var dataJSon = JSON.stringify(data);
        console.log( dataJSon );
        submitToServer("http://localhost:8080/employees", dataJSon);
        
        
        $("#addNew").removeClass("active in").prop("aria-expanded", "false");
        $("#empTbl").addClass("active in").prop("aria-expanded", "true");
        $("#displayEmp").puidatatable("reload");
        alert("Employee is saved");
    });

    //Display Messages.
    $('#msgsMenu').click(function() {
        $.ajax({
            url: "http://localhost:8080/messages",
            success: function(data) {
                displayMsg(data);
            }
        });
        
    });

    $('#searchMsg').keypress(function (e) {
        var key = e.which;
        if(key == 13) {
            e.preventDefault();
            $.ajax({
                url: "http://localhost:8080/messages/"+$(this).val(),
                success: function(data) {
                    if(data == undefined) {
                        alert("Message ID entered does not exist.");
                        return;
                    }
                    console.log(data);
                    var dataArr = [];
                    dataArr[0] = data;
                    displayMsg(dataArr);
                }
            });
        }
    });

    $('.btnSend').click(function(){
        var dataJSon = JSON.stringify(formatEmail());
        console.log(dataJSon);
        submitToServer("http://localhost:8080/messages", dataJSon); 
    });

    //Functions.
    function submitToServer(url, Jdata) {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: url,
            data: Jdata,
            success: function(data, status ) {
                console.log(status);
            },
            dataType: "json"
        });
    }

    function formatEmail() {
        var to = {"id":""};
        var data = {
            "subject":$("#inputSubject").val(),
            "body": $("#inputBody").val(),
            "from_employee":{"id":"3"},
            "to_employees":[],
            };
        for(var i=0; i<msgRecipient.length; i++) {
            if(msgRecipient[i]!="") {
                to = Object.create(to);
                to.id = msgRecipient[i];
                data.to_employees.push(to);
                console.log(data.to_employees);
            }
        }
        return data;
    }

    function displayMsg(data) {
        $(".list-group").empty();
        for(var i=0; i<data.length; i++) {
            var itmLi = $("<li/>").addClass("list-group-item");
            var itmRow = $("<div/>").addClass("row");
            var itmCol1 = $("<div/>").addClass("col-xs-2 col-md-1");
            var itmImg = $("<img/>").addClass("img-circle img-responsive").prop("src", "http://placehold.it/80");
            var itmCol2 = $("<div/>").addClass("col-xs-10 col-md-11");
            var div = $("<div/>");
            var subj = $("<a>"+data[i].subject+"</a>").prop("href", "#");
            var empHrefContent = "ID: "+data[i].from_employee["id"]+"<br/>"+"Name: "+
                data[i].from_employee["firstname"]+" "+data[i].from_employee["lastname"];
            var EmpHref = $("<a>"+data[i].from_employee["email"]+"</a>").prop({"href":"#"}).attr({"data-toggle":"popover", 
                "data-trigger":"hover", "data-placement":"right", "data-content":empHrefContent, "data-html":"true"});
            var msgFromInfo = $("<div>From: </div>").addClass("msg-info");
            var dateStr = new Date(data[i].created);
            var msgInfo = msgFromInfo.append(EmpHref).append(" on "+dateStr.toUTCString()).append("<br>To: ");
            //Recipients.
            for(var r=0; r<data[i].to_employees.length; r++) {
                empHrefContent = "ID: "+data[i].to_employees[r].id+"<br/>"+"Name: "+data[i].to_employees[r].firstname+" "+data[i].to_employees[r].lastname;
                EmpHref = $("<a>"+data[i].to_employees[r].email+" </a>").prop({"href":"#"}).attr({"data-toggle":"popover", "data-trigger":"hover", 
                    "data-placement":"bottom", "data-content":empHrefContent, "data-html":"true"});;
                msgInfo = msgInfo.append(EmpHref);
            }
            var msgBody = $("<div/>").addClass("msg-body").append(data[i].body).css("padding-top", "10px");

            $(".list-group").append(itmLi).children(":last").append(itmRow).children(":last")
                .append(itmCol1).children(":last").append(itmImg);
            $(".list-group").children("li:last").children(".row:last").append(itmCol2).children(":last").append(div).children(":last").append(subj, msgInfo, msgBody);
            $('[data-toggle="popover"]').popover();
        }
    }

});

