$(function(){
	var iden = "";
	var token = "";
	var connected = "";
	//hide message div and buttons
    $( ".outbtn" ).hide();
	$( "#msg" ).hide();
	//try to get pushbullet oauth2 token and user iden
	iden = localStorage.getItem("iden");
	token = localStorage.getItem("token");
	//if token exists set menu labels
	if (typeof token == "undefined" || token == null){
		connected = false;
		$("#connect").html("Click to connect to PushBullet.");
	}
	else{
		connected = true;
		$("#connect").html("You are connected to PushBullet. Click to disconnect.");
	}
	//block for initializing after redirect - get page valuess before authorization redir and set them after
	var pOne = localStorage.getItem("pageOne");
	var pTwo = localStorage.getItem("pageTwo");
	if (!(typeof pOne == "undefined" || pOne == null)){
		$("#pageOne").val(pOne);
	}
	if (!(typeof pTwo == "undefined" || pTwo == null)){
		$("#pageTwo").val(pTwo);
	}
	//and set page values in storage to null
	localStorage.setItem("pageOne","");
	localStorage.setItem("pageTwo","");
	
	//click to header reset page
    $("header h1").click(function(){
        $("#output").html("");
        $("#msg").html("");
		$("#msg").hide();
        $("#pageOne").val("");
        $("#pageTwo").val("");
        $( ".outbtn" ).hide();
    });
	//click on menu - connects to pushbullet
    $("#connect").click(function () {
		if (!connected){
			//if not connected and page values exists - remember them
			localStorage.setItem("pageOne",$("#pageOne").val());
			localStorage.setItem("pageTwo",$("#pageTwo").val());
			//go to oauth2 url and retrieve token to local storage
			var auth_url = "https://www.pushbullet.com/authorize";
			var client_id = "d0pAmEUSSv5UsqquvH77DGG1Kfj6IwKK";
			var redirect_uri = "https://www.pushbullet.com/login-success";
			var response_type = "token";
			var login_url = auth_url + '?' + $.param({ client_id: client_id, redirect_uri: redirect_uri, response_type: response_type });
			var loginWindow = window.open(login_url, '_self', 'location=yes');
			/*if (win) {win.focus();} else {alert('Please allow popups for this website');}*/
			$(loginWindow).on('loadstart', function(e) {
				var url = e.originalEvent.url;
				var access_token = url.split("access_token=")[1];
				localStorage.setItem("token",access_token);
			});
		}
		else{
			//if already connected to pushbullet - clear token and other data and reset page
			localStorage.clear();
			iden = localStorage.getItem("iden");
			token = localStorage.getItem("token");
			connected = false;
			$("#connect").html("Click to connect to PushBullet.");
		}
	});
	
	//close app
    $("#closeMeNow").click(function () {
		navigator.notification.confirm(
			   'Do you want to quit', 
			   onConfirmQuit, 
			   'Exit PrintBrochure?', 
			   'OK,Cancel'  
		);
	});
	
	//main functionality - calculate pages
    $("#calculate").click(function (event) {
		//get page values
        var pageOne = parseInt($("#pageOne").val(),10);
        var pageTwo = parseInt($("#pageTwo").val(),10);
        var numPage = $("#numPage").prop("checked") ? 8: 4;
        
        $( ".outbtn" ).hide();
        
		//check page values - only positive numbers from 1 to 5000
        $("#msg").html("");
        if (isNaN(pageOne) || pageOne < 1 || pageOne > 5000){
            $("#msg").html("You should enter valid first page: positive number up to 5000");
			$( "#msg" ).show();
        }
        else if (isNaN(pageTwo) || pageTwo < 1 || pageTwo > 5000){
            $("#msg").html("You should enter valid second page: positive number up to 5000");
			$( "#msg" ).show();
        }
        else {
		    //check page values for order
			$("#output").html('');
			if (pageOne > pageTwo) {
				var changePageOrder = pageOne;
				pageOne = pageTwo;
				pageTwo = changePageOrder;
			}
			//if all correct get pages for printing
            var res = printBrochure(pageOne, pageTwo, numPage);
            $("#output").html("<pre>"+res+"</pre>");
            $(".outbtn").show();
			$("#msg").hide();
        }
        event.preventDefault();
    });
	
    //copy to buffer pages
    $("#copy").click(function () {
        $("#copyValue").select();
        document.execCommand('copy');
    });
    
	//
    $("#push").click(function () {
	    if (!connected){
			$("#msg").html("You are disconnected from PushBullet. Go to Settings and connect.");
			$("#msg").show();
		}
		else {
			console.log('Will be PUSH');
			$.ajax({	 
				// The URL for the request
				url: "http://portfolios.pp.ua/done.php",
				// Whether this is a POST or GET request
				type: "POST",
				data : {
					'body':$("#copyValue").val(),
					'title':'PrintBrochure pages',
					'type':'note',
					'token':token,
					'iden':iden
				},
				// The type of data we expect back
				dataType : "text"
			})
			.done(function( data ) {
				//console.log(data);
				//jQuery.parseJSON(JSON.stringify(data));
				alert('PUSHed succesfully');
			})
			.fail(function( xhr, status, errorThrown ) {
				alert( "PUSH, there was a problem!" );
				console.log( "Error: " + errorThrown );
				console.log( "Status: " + status );
				console.dir( xhr );
			});
		}
		
    });
});
	/*Object.keys(localStorage).forEach(function(key){
	   console.log("lS: "+localStorage.getItem(key));
	});*/
	
function onConfirmQuit(button){
   if(button == "1"){
     navigator.app.exitApp(); 
   }
}

var printPagesArray = [], rows;

function printBrochure(firstPage, secondPage, np){

    var sheetAmount, pageAmount, leftPage, rightPage, pageIndex;

    var pagesArray = [];
    var lastPage = [];
    var result = "";
    //amount of pages
    pageAmount = secondPage - firstPage +1;
    rows = pageAmount;
    //count for sheets of paper
    sheetAmount = Math.ceil(pageAmount/np);

    //creating an array of page numbers from first to last page
    for (pageIndex = firstPage; pageIndex <= secondPage; pageIndex++) {
        pagesArray.push(pageIndex);
    }
    //находим середину np = 8 или 4 - число страниц на одном листе, нужна половина - число на 1й странице
    if (pageAmount % (np/2) == 0) { /*чет*/
        leftPage = pageAmount/2-1; /*левая серединка*/
        rightPage = leftPage+1; /*правая серединка*/
    }
    else { /*нечет*/
        leftPage = Math.floor((pageAmount/2)); /*левая серединка*/
        rightPage = leftPage+1; /*правая серединка*/
    }
    result += "from " + firstPage + " to " + secondPage + " is " + pageAmount +" pages. Sheets: " + sheetAmount;

    //формируем массив страниц каждая запись массива - 4 или 8 страницы на листе
    printPagesArray.length = 0;
    formArrayOfPages(printPagesArray, pagesArray, leftPage, rightPage, sheetAmount, np);

    //выводит то что вставляем в строку печати страниц
    return result + "\r\n" + arrayPages(printPagesArray, sheetAmount, np);

}


function formArrayOfPages(printPagesArray, pagesArray, leftPage, rightPage, sheetAmount, np)
{
    //формируем массив страниц
    var pageIndex=0;
    //каждая запись массива - 4 или 8 страницы на листе
    if (np == 4)
    {
        while (pageIndex < sheetAmount)
        {
            var fourPagesPerSheet = [];
            var frontLeft, frontRight, backLeft, backRight;
            var printPagesArraySize = pagesArray.length;
            //проверка что след страница существует, если нет - то в мссив вносим 0
            if (leftPage >= 0) {frontLeft = pagesArray[leftPage];} else {frontLeft = 0;}
            if (rightPage < printPagesArraySize) {frontRight = pagesArray[rightPage];} else {frontRight = 0;}
            if (rightPage+1 < printPagesArraySize) {backRight = pagesArray[rightPage+1];} else {backRight = 0;}
            if (leftPage-1 >= 0) {backLeft = pagesArray[leftPage-1];} else {backLeft = 0;}

            fourPagesPerSheet.push(frontLeft);
            fourPagesPerSheet.push(frontRight);
            fourPagesPerSheet.push(backRight);
            fourPagesPerSheet.push(backLeft);
            printPagesArray.push(fourPagesPerSheet);
            leftPage=leftPage-2;
            rightPage=rightPage+2;
            pageIndex++;
        }
    }
    if (np == 8)
    {
        while (pageIndex < sheetAmount)
        {
            var eightPagesPerSheet = [];
            var frontLeftTop, frontRightTop, backLeftTop, backRightTop, frontLeftBottom, frontRightBottom, backLeftBottom, backRightBottom;
            var printPagesArraySize = pagesArray.length;

            //проверка что след страница существует, если нет - то в мссив вносим 0
            if (leftPage >= 0) {frontLeftTop = pagesArray[leftPage];} else {frontLeftTop = 0;}
            if (rightPage < printPagesArraySize) {frontRightTop = pagesArray[rightPage];} else {frontRightTop = 0;}
            if (leftPage - 2 >= 0) {frontLeftBottom = pagesArray[leftPage - 2];} else {frontLeftBottom = 0;}
            if (rightPage + 2 < printPagesArraySize) {frontRightBottom = pagesArray[rightPage + 2];} else {frontRightBottom = 0;}

            if (rightPage + 1 < printPagesArraySize) {backRightTop = pagesArray[rightPage+1];} else {backRightTop = 0;}
            if (leftPage - 1 >= 0) {backLeftTop = pagesArray[leftPage-1];} else {backLeftTop = 0;}
            if (rightPage + 3 < printPagesArraySize) {backRightBottom = pagesArray[rightPage+3];} else {backRightBottom = 0;}
            if (leftPage - 3 >= 0) {backLeftBottom = pagesArray[leftPage-3];} else {backLeftBottom = 0;}


            eightPagesPerSheet.push(frontLeftTop);
            eightPagesPerSheet.push(frontRightTop);
            eightPagesPerSheet.push(frontLeftBottom);
            eightPagesPerSheet.push(frontRightBottom);

            eightPagesPerSheet.push(backRightTop);
            eightPagesPerSheet.push(backLeftTop);
            eightPagesPerSheet.push(backRightBottom);
            eightPagesPerSheet.push(backLeftBottom);

            printPagesArray.push(eightPagesPerSheet);
            leftPage=leftPage-4;
            rightPage=rightPage+4;
            pageIndex++;
        }
    }

}


function arrayPages(printPagesArray, sheetAmount, np)
{
    var result = "<textarea id='copyValue' readonly wrap='off'>";
    for (var i = 0; i < sheetAmount-1; i++)
    {
        printPagesArray[i].forEach(function(n) {
            result += n + ",";
        });
    }
    //маcсив с номерами страниц на последнем листе
    var lastSheet = printPagesArray[sheetAmount - 1];

    var lastSheetSize = np;
    var lastPage = lastSheet[lastSheetSize-1];
    var preLastPage = lastSheet[lastSheetSize-2];

    if (np == 4)
    {
        //если на крайнем листе 3 страницы, то для обратной стороны надо менять порядок печати
        if ((lastPage != 0) & (preLastPage == 0)) {
            result += lastSheet[lastSheetSize - 4] + ",";
            result += lastSheet[lastSheetSize - 3] + "</textarea>";
            result += "\r\nThen you need to: set in the Printer Properties Order - 'left' (or 'right to left') and print last page - " + lastPage;

        } else {
            lastSheet.forEach (function(n) {
                if (n != 0) {
                    result += n + ",";
                }
            });
            result += "</textarea>";
        }
    }

    if (np == 8)
    {
        //удаляем из массива последней страницы все 0
        lastSheet = lastSheet.filter(function(value){
            return value > 0;
        });

        lastSheetSize = lastSheet.length;

        if (lastSheetSize == 8)
            {lastSheet.forEach(function(lp){ result += lp + ","}); result += "</textarea>";}

        if (lastSheetSize == 7)
        {
            var i = 0;
            for (; i < lastSheetSize - 1; i++) result += lastSheet[i] + ",";
            result += "</textarea>\r\nThen you need to: slice the last sheet, insert blank half of sheet in the printer, set in the Printer Properties Order - \"left, then down\" and print last page - " + lastSheet[i];
        }

        if (lastSheetSize == 6)
        {
            result += "</textarea>\r\nThen you need to: print on the last sheet at the one side -  " + lastSheet[0] + "," + lastSheet[1] + "," + lastSheet[2] + "\r\nat the other side print - " + lastSheet[3] + "," + lastSheet[4] + "\r\nslice the last sheet, insert blank half of sheet in the printer, set in the Printer Properties Order - \"left, then down\" and print last page - " + lastSheet[5];
        }

        if (lastSheetSize == 5)
        {
            result += "</textarea>\r\nThen you need to: print on the last sheet at the one side -  " + lastSheet[0] + "," + lastSheet[1] + "," + lastSheet[2] + "\r\nturn the sheet, at the other side print - " + lastSheet[3] + "," + lastSheet[4];
        }

        if (lastSheetSize == 4)
        {
            result += "</textarea>\r\nЗатем необходимо: print on the last sheet at the one side -  " + lastSheet[0] + "," + lastSheet[1] + "\r\nturn the sheet, at the other side print - " + lastSheet[2] + "," + lastSheet[3];
        }

        if (lastSheetSize == 3)
        {
            result += "</textarea>\r\nThen you need to: print on the last sheet at the one side -  " + lastSheet[0] + "," + lastSheet[1] + "\r\nturn the sheet, set in the Printer Properties Order - \"left, then down\" and print last page - " + lastSheet[2];
        }

        if (lastSheetSize == 2)
        {
            result += "</textarea>\r\nThen you need to: print on the last sheet at the one side -  " + lastSheet[0] + "\r\nturn the sheet, set in the Printer Properties Order - \"left, then down\" and print last page - " + lastSheet[1];
        }

        if (lastSheetSize == 1)
        {
            result += lastSheet[0];
            result += "</textarea>";
        }
    }

    return result;
}