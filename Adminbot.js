const { exec } = require('child_process');
const fs = require("fs");
const child_process = require("child_process");
const iconv = require("iconv-lite");
var url = require('url');
var http = require('http');
const request = require('request');
//---------------VK DIV--------------
var VK = require('vk-call').VK;
var token = '5ebca4231e46ef1758da02b7d5120dc5686dda59a7213a7d8b1be802d2c17f9970da2129e9c6c59d37548';
var version = '5.95';
var vk = new VK({
    token,
    version,
    groupId: 183808535,
});
var admin1_id = 247747335;
var longpoll = vk.persistentLongpoll();
var work = false;
sendMes('AdminBot activated',admin1_id);
//----------------------------------------
longpoll.sink.on('data', (events) => {
    events.forEach((event) => {
        if(event.type=='message_new'){
	            //console.log(event.object.attachments);
	            var msg = event.object;
	            if(msg.text.length>1){
	            	    if(msg.peer_id==admin1_id && msg.text[0]=='!'){
	            	    	if(msg.text=='!!'){
	            	    		if(work){
	            	    			sendAdm('Выключи бота.');
	            	    		}else{
	            	    			offBot();
	            	    		}
	            	    	}else if(msg.text=='!?'){
            	        	     if(work){
            	        	     	work=false;
            	        	     }else{
            	        	     	sendAdm('Бот и так не работает.');	
            	        	     }
            	        	}else if(msg.text=='!+'){
            	        		    if(!work){
            	        		    	  onBot();
            	        		    	  work=true;
            	        		    }else{
            	        		    	sendAdm('Бот уже работает.');
            	        		    }
            	        	}else if(msg.text=='!setBot'){
            	        		    if(!work){
        	        		    	    msg.attachments.forEach((att)=>{
        	        		    	        ChangeBotCode(att.doc.url); //set code from attached file
        	        		    	    });
            	        		        sendAdm('Bot.js изменен.');
            	        		    }else{
            	        		    	sendAdm('Выключи бота.');
            	        		    }
            	        	}else if(begins(msg.text,"!getFile_")){
            	        		    if(!work){
            	        		        GetFile(msg.text.substring(9));//get File.txt
            	        		    }else{
            	        		    	sendAdm('Выключи бота.');
            	        		    }
            	        	}else if(begins(msg.text,"!setFile_")){
            	        		    if(!work){
        	        		    	    SetFile(msg.attachments[0].doc.url,msg.text.substring(9)); //set file from attached file
            	        		        sendAdm('File изменен.');
            	        		    }else{
            	        		    	sendAdm('Выключи бота.');
            	        		    }
            	        	}
	            	    }
	            	}
	        }
    });
});


async function offBot(){
	await vk.call('messages.send', {
        message: 'AdminBot deactivated',
        peer_id: admin1_id, 
        random_id: 0,         
	});
	process.exit(1);
}

async function ChangeBotCode(file_url){
	var options = {
		url: file_url,
		followAllRedirects: true
	}; 
	await request
	.get(options)
	.on('error', function(err) { console.log(err) })
    .pipe(iconv.decodeStream('win1251'))
    .pipe(iconv.encodeStream('utf8'))
	.pipe(fs.createWriteStream(__dirname + '/Bot.js'));
}

function GetFile(filename){
	//console.log(filename);
	vk.call("docs.getMessagesUploadServer",{
		type: "doc",
		peer_id :admin1_id
	}).then(res => {
		//console.log(res);
		const options = {
		    method: "POST",
		    url: res.upload_url,
		    formData : {
		        "file" : fs.createReadStream(__dirname + '/' + filename)
		    }
		};
		request(options, function (err, res, body) {
		    if(!err){
		    	var json = JSON.parse(body);
		    	//console.log(json.file);
		    	vk.call("docs.save",{
					file: json.file,
					title :filename
				}).then(res1 => {
					vk.call('messages.send', {
				        message: "Лови,сладкий&#128420;",
				        peer_id: admin1_id, 
				        random_id: 0,
				        attachment: "doc"+admin1_id+"_"+res1.doc.id        
					});
				}).catch(error1 => {console.log(error1);});
		    }
		});
	}).catch(error => {console.log(error);});
}

function SetFile(file_url,filename){
	var options = {
		url: file_url,
		followAllRedirects: true
	}; 
	request
	.get(options)
	.on('error', function(err) { console.log(err) })
	.pipe(iconv.decodeStream('win1251'))
    .pipe(iconv.encodeStream('utf8'))
	.pipe(fs.createWriteStream(__dirname + '/' + filename,'utf8'));
}

function onBot(){
    exec(__dirname + '/scripts/run_bot.sh', (err, stdout, stderr) => { });
}

function sendAdm(text){
	sendMes(text,admin1_id);
}

function sendMes(text, id){
	vk.call('messages.send', {
        message: text,
        peer_id: id, 
        random_id: 0,         
	});
}

function begins(str,beg){
	if(str.length>=beg.length){
		if(str.substr(0,beg.length)==beg){
			return true;
		}
	}
	return false;
}
