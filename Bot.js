//-----------CONST---------
var langs = ['GNU GCC C11 5.1.0','Clang++17 Diagnostics','GNU G++11 5.1.0','GNU G++14 6.4.0','GNU G++17 7.3.0','Microsoft Visual C++ 2010','Microsoft Visual C++ 2017','C# Mono 5.18','D DMD32 v2.086.0','Go 1.12.6','Haskell GHC 8.6.3','Kotlin 1.3.10','OCaml 4.02.1','Delphi 7','Free Pascal 3.0.2','PascalABC.NET 3.4.2','Perl 5.20.1','PHP 7.2.13','Python 2.7.15','Python 3.7.2','PyPy 2.7(7.1.1)','PyPy 3.6(7.1.1)','Ruby 2.0.0p645','Rust 1.35.0','JavaScript V8 4.8.0','Node.js 9.4.0'];
var langs_in_json = ['GNU C11','Clang++17 Diagnostics','GNU C++11','GNU C++14','GNU C++17','MS C++','MS C++ 2017','Mono C#','D','Go','Haskell','Kotlin','Ocaml','Delphi','FPC','PascalABC.NET','Perl','PHP','Python 2','Python 3','PyPy 2','PyPy 3','Ruby','Rust','JavaScript','Node.js'];
var months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
var alpha = ['A','B','C','D','E'];
var qual_of_exs = 5;
var qual_of_langs = langs.length;
var admin1_id = 247747335;
var alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
var STATUS_NOT_LOGGED = 0;
var STATUS_START= 1;
var STATUS_WAITING_ADMIN= 2;
var STATUS_WAITING_CF= 3;
var STATUS_LOGGED= 4;
//-------------DIFFERENT REQUIRES---------
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const request = require("request");
const iconv = require('iconv-lite');
const crypto = require('crypto');
//-------------CLASSES------
class Result{
	constructor(CfNick,Exs,Result){
		this.cfNick = CfNick;
		this.exs = Exs;
		this.result = Result;
	}
}

class User{
	constructor(Id){
		this.id = Id;
		this.status = 0;
		this.cfNick = "nick";
		this.balance = 0;
		this.phone = "NoPhone";
		this.exNum = -1;
		this.langNum = -1;
	}
	change(Id,Status,CfNick,Balance,Phone,ExNum,LangNum){
		this.id = Id;
		this.status = Status;
		this.cfNick = CfNick;
		this.balance = Balance;
		this.phone = Phone;
		this.exNum = ExNum;
		this.langNum = LangNum;
	}
}

//---------------TXT work -----------
const fs = require("fs");

let varsTXT = fs.readFileSync(vars_path, "utf8");
let varsArr = varsTXT.split(' ');
var Glob_ex = Number(varsArr[0]);
var Glob_lang = Number(varsArr[1]);
//------
let UsersTXT = fs.readFileSync(users_path, "utf8");
let UsersRows = UsersTXT.split('\n');
var Users = [];
for (let i = 0; i < UsersRows.length-1; i++) {
	let UserTXT = UsersRows[i].split(' ');
	for(let j = 0; j < UserTXT.length; j++){
		if(isNumeric(UserTXT[j])) UserTXT[j]=Number(UserTXT[j]);
	}
	let LocalUser = new User(0);
	LocalUser.change(UserTXT[0],UserTXT[1],UserTXT[2],UserTXT[3],UserTXT[4],UserTXT[5],UserTXT[6]);
	Users.push(LocalUser);
	//console.log(loc);
}
//------------CODEFORCES API---------
var api_key = 'd23ac1cda57029d2cdf31f590803a847f3994c78';
var secret = '90756798cac6fb79f36b7be24dde9141b92f9488';
var rand = '135792';
var contest_ID = '248774';
var link_to_join_contest = 'https://codeforces.com/group/F2SyNTViKv/contest/248774/submit';
var cnt_status = 3;
//---------------VK DIV--------------
var VK = require('vk-call').VK;
var token = 'd02ed18d0903f73fd25e6cd238810108d331fcae0ca4dfc575494ca2e75e32dc0a7cf359b928499125a05';
var version = '5.95';
var vk = new VK({
    token,
    version,
    groupId: 183808535,
});
var name_of_public = 'ContestTime';
vk.call("groups.getById",{
	group_id: "183808535",
}).then(res => {
	name_of_public = res[0].name;
}).catch(err => {console.log(err);});
var longpoll = vk.persistentLongpoll();
sendMesToAdmin('Бот включен.');
log('Bot on');
//----------------------------------------
temp_path = __dirname + '/temp'
vars_path = temp_path + '/vars.txt'
handles_path = temp_path + '/Handles.txt'
log_path = temp_path + '/Log.txt'
users_path = temp_path + '/Users.txt'
//----------------------------------------
longpoll.sink.on('data', (events) => {
    events.forEach((event) => {
        if(event.type=='message_new'){
	        //console.log(Users);
	        var msg = event.object;
	        if (msg.peer_id==admin1_id && msg.text[0]=='!' && msg.text.length>1){
	        	//if admin
	        	if(msg.text=='!?'){
	        		log("Bot off");
	        		off();
	        	}else if((msg.text[1]=='Y' || msg.text[1]=='N')){
        			let bufArr = msg.text.substring(2).split('/');
        			let acceptingId = bufArr[1].substring(2);//id of user
        			let ind = findUser(acceptingId);
        			if(Users[ind].status==STATUS_WAITING_ADMIN){
	        			if(msg.text[1]=='Y'){
	        				log("accepted user id "+Users[ind].id);
	        				//Iterating GlobalVars
	       					Glob_ex = (Glob_ex+1)%qual_of_exs;
							if(Glob_ex==0){
								Glob_lang = (Glob_lang+1)%qual_of_langs;
							}
							//Delete previos session on this ex,lang
							for (let i = 0; i < Users.length; i++) {
								if(Users[i].exNum==Glob_ex && Users[i].langNum==Glob_lang){
									Users[i] = new User(Users[i].id);
								}
							}	

							//update user
	        				Users[ind].status=STATUS_WAITING_CF;
	        				Users[ind].exNum=Glob_ex;
	        				Users[ind].langNum=Glob_lang;


				        	//Contact with user 
				            let num_of_ex = Glob_ex;
				        	let num_of_lang = Glob_lang;
							sendMes('Администратор подтвердил вашу заявку. '+generateChangingMessage(num_of_ex,num_of_lang),Users[ind].id);
	        			}else if(msg.text[1]=='N'){
	        				log("rejected user id "+Users[ind].id);
							Users[ind] = new User(Users[ind].id);
							sendMes('Администратор не подтвердил вашу регистрацию. Попробуйте заново (Начиная с *Начать* без звездочек) или обращайтесь к vk.com/id'+admin1_id,Users[ind].id);
	        			}
        			}
        		}else if(begins(msg.text,"!sendAll_")){
        			sendAll(msg.text.substring(9));
        		}else if(same(msg.text,"!getHandles")){
        			fs.writeFileSync(handles_path,"");
					let all_handles = "";
        			for(let j = 0; j < Users.length; j++){
        				if(Users[j].status==STATUS_LOGGED){
        					all_handles+=Users[j].cfNick+" ";
        				}
        			}
        			all_handles = all_handles.substr(0,all_handles.length-1);
        			fs.writeFileSync(handles_path, all_handles);
        			vk.call("docs.getMessagesUploadServer",{
						type: "doc",
						peer_id :admin1_id
					}).then(res => {
						const options = {
						    method: "POST",
						    url: res.upload_url,
						    formData : {
						        "file" : fs.createReadStream(handles_path)
						    }
						};
						request(options, function (err1, res1, body1) {
						    if(!err1){
						    	let json = JSON.parse(body1);
						    	vk.call("docs.save",{
									file: json.file,
									title :"Handles.txt"
								}).then(res2 => {
									log("handles sended");
									vk.call('messages.send', {
								        message: "Лови,сладкий&#128420;",
								        peer_id: admin1_id, 
								        random_id: 0,
								        attachment: "doc"+admin1_id+"_"+res2.doc.id        
									});
								}).catch(err2 => {console.log(err2);});
						    }
						});
					}).catch(err => {console.log(err);});
        		}
	        }else{
	        	let ind = findUser(msg.peer_id);
				let userStatus = Users[ind].status;
				if(userStatus==STATUS_NOT_LOGGED){
					if (same(msg.text,'Начать')) {
						Users[ind].status=STATUS_START;
						sendMes('Если у Вас нет аккаунта на codeforces.com - зарегистрируйтесь. Следующим сообщением пришлите только Ваш ник(хэндл) с сайта Codeforces.',msg.peer_id);
					}else{
						sendMes('Вы не зарегистрированы или сессия регистрации устарела. Пишите *Начать* чтобы зарегистрироваться.',msg.peer_id);
					}
				}else if(userStatus==STATUS_START){
					let gotCFnick = msg.text.replace(/ /g,"");
					let ok = true;
					for(let j = 0; j < Users.length; j++){
						if(Users[j].cfNick==gotCFnick) ok=false;
					}
					if(ok){
						Users[ind].status=STATUS_WAITING_ADMIN;
						Users[ind].cfNick=gotCFnick;
						sendMes('Спасибо, теперь ожидайте подтверждения администратора.',msg.peer_id);
						sendMesToAdmin(gotCFnick);
						sendMesToAdmin('vk.com/id'+msg.peer_id);
						sendMesToAdmin('*Добавить в группу на CF.');
					}else{
						Users[ind]= new User(Users[ind].id);
						sendMes('Данный ник уже зарегистрирован.',msg.peer_id);
					}
				}else if(userStatus==STATUS_WAITING_ADMIN){
					sendMes('Ожидайте подтверждения администратора.',msg.peer_id);
				}else if(userStatus==STATUS_WAITING_CF){
					if(same(msg.text,'Продолжить')){
						let ok = false;
						let need_exc = alpha[Users[ind].exNum];
						let need_lang = langs_in_json[Users[ind].langNum];
						//console.log(need_exc);
						//console.log(need_lang);
						//codeforces api-------------------
						let quer = Quer(1,Users[ind].cfNick);
						let xhr = new XMLHttpRequest();
						xhr.open('GET', quer, false);
						xhr.send();
						if (xhr.status == 200) {
							let json = JSON.parse(xhr.responseText);
							//console.log(json);
						 	if(json.status=='OK'){
						 		json.result.forEach((subm) => {
						 			if(subm.problem.index==need_exc && subm.programmingLanguage==need_lang) ok = true;
						 		});
						 	}
						}
						//---------------------------------
						if(ok){
		        			Users[ind].status = STATUS_LOGGED;
		        			Users[ind].exNum = -1;
		        			Users[ind].langNum = -1;
		        			log("new user id "+Users[ind].id);
		        			sendMes('Все успешно! Вы зарегистрированы. Возможные команды:\nУдалить аккаунт\nПрофиль\nТелефон:*Ваш телефон, например 89131234567*\nУдалить телефон',msg.peer_id);
		        		}else{
		        			Users[ind]= new User(Users[ind].id);
			           		sendMes('Ой&#128522;, регистрация не проведена.\nСкорее всего, вы выбрали не тот язык или задачу. \n Чтобы начать заново, напишите *Начать* без звездочек',msg.peer_id);
		        		}
					}else{
						sendMes('Необходимо написать *Продолжить* без звездочек, если вы отправили необходимую попытку.',msg.peer_id);
					}
				}else if(userStatus>=STATUS_LOGGED){
					if(same(msg.text,'Удалить аккаунт')){
						log("user deleted id "+Users[ind].id);
						sendMes('Аккаунт удален. R.I.P. '+Users[ind].cfNick+"\nЧтобы снова зайти, напиши *Начать* без звездочек.",msg.peer_id);
						Users[ind] = new User(Users[ind].id);
					}else if(same(msg.text,'Профиль')){
						let profile = "Хэндл: "+Users[ind].cfNick+"\nБаланс: "+Users[ind].balance+"\nТелефон: "+Users[ind].phone;
						sendMes(profile,msg.peer_id);
					}else if(begins(msg.text,'Телефон')){
						let bufArr = msg.text.split(":");
						if(bufArr.length>1){
							let gotPhone = bufArr[1].replace(/ /g,"");
							if(isNumeric(gotPhone) && gotPhone.length==11){
								Users[ind].phone = gotPhone;
								sendMes('Телефон успешно сменен на '+gotPhone,msg.peer_id);
							}else{
								sendMes('Неверный формат телефона: '+gotPhone+"\nНеобходимо что-то такое: 89131234567",msg.peer_id);
							}
						}else{
							sendMes('Неверный формат запроса на смену телефона. Необходимо что-то такое:\nТелефон:89131234567',msg.peer_id);
						}
					}else if(same(msg.text,'Удалить телефон')){
						Users[ind].phone = "NoPhone"
						sendMes('Телефон удален.',msg.peer_id);
					}else{
						sendMes('Не понимаю. Возможные команды:\nУдалить аккаунт\nПрофиль\nТелефон:*Ваш телефон, например 89131234567*\nУдалить телефон',msg.peer_id);
					}
				}
	        }
        }
    });
});


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function sendAll(text){
	for(let i = 0; i < Users.length; i++){
		if(Users[i].status==STATUS_LOGGED){
			await vk.call('messages.send', {
		        message: text,
		        peer_id: Users[i].id, 
		        random_id: 0,         
			});
		}
	}
}

async function sendALLALL(text){
	for(let i = 0; i < Users.length; i++){
		await vk.call('messages.send', {
	        message: text,
	        peer_id: Users[i].id, 
	        random_id: 0,         
		});
	}
}

async function off(){
	fs.writeFileSync(vars_path, Glob_ex + ' ' + Glob_lang);
	let users = '';
	for(let i = 0; i < Users.length; i++){
		let user_values = Object.values(Users[i]);
		let text = '';
		for(let j = 0; j < user_values.length-1; j++){
			text+=user_values[j]+' ';
		}
		text+=user_values[user_values.length-1];
		users = users + text + '\n';
	}
	fs.writeFileSync(users_txt,users);
	await vk.call('messages.send', {
        message: 'Бот отключен.',
        peer_id: admin1_id, 
        random_id: 0,         
 	});
	process.exit(1);
}


//----------------------UTILS-----------------
function findUser(id){
	let ind = -1;
	for (let i = 0; i < Users.length; i++) {
		if(Users[i].id==id){
			ind = i;
		}
	}
	if(ind == -1){
		Users.push(new User(id));
		ind = Users.length - 1;
	}
	return ind;
}

function findUserByCodeF(handle){
	for (let i = 0; i < Users.length; i++) {
		if(Users[i].cfNick==handle){
			return i;
		}
	}
	return -1;
}

function Quer(ind,hndl){
	let time_now = '' + Math.round(+new Date()/1000);
	let hash_start = rand+'/contest.status?apiKey='+api_key+'&contestId='+contest_ID+'&count='+cnt_status+'&from='+ind+'&handle='+hndl+'&time='+time_now+'#'+secret;
	let sha = crypto.createHash('sha512').update(hash_start);
	let hash_end = sha.digest('hex');
	let quer = 'http://codeforces.com/api/contest.status?apiKey='+api_key+'&contestId='+contest_ID+'&count='+cnt_status+'&from='+ind+'&handle='+hndl+'&time='+time_now+'&apiSig='+rand+hash_end;
	return quer;
}


function isNumeric(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

function generateChangingMessage(a,b){
	a+=1;
	return 'Чтобы подключиться к \^'+name_of_public+'\^ ЧЕТКО следуйте этим инструкциям: \n1) Авторизируйтесь в своем браузере на сайте Codeforces.\n2) Вступите в нашу группу ContestTime на Codeforces (Уведомление в правом верхнем углу на сайте codeforces). \n3) Отправьте ЛЮБУЮ посылку:\n -Задача номер: '+a+'\n -Язык: '+langs[b]+'\n -Ссылка: '+link_to_join_contest+'\n4) Как будете готовы -  напишите *Продолжить* без звездочек сюда&#128522;';
}

function dontUnderstand(id){
	sendMes('Не понимаю.',id);
}

function sendMesToAdmin(text){
	sendMes(text,admin1_id);
}

function sendMes(text, id){
	vk.call('messages.send', {
        message: text,
        peer_id: id, 
        random_id: 0,         
	});
}


function same(got,need){
	if(Math.abs(got.length-need.length)>1){
		return false;
	}
	if(got==need){
		return true;
	}
	let newGot = "";
	for(let i = 0; i <= got.length; i++){
		for(let j = 0; j < alphabet.length; j++){
			newGot = got.substring(0,i) + alphabet[j] + got.substring(i);
			if(newGot==need){
				return true;
			}
		}
	}

	for(let i = 0; i+1 < got.length; i++){
		for(let j = 0; j < alphabet.length; j++){
			newGot = got.substring(0,i) + alphabet[j] + got.substring(i+1);
			if(newGot==need){
				return true;
			}
		}
	}

	for(let i = 0; i+1 < got.length; i++){
		newGot = got.substring(0,i) + got.substring(i+1);
		if(newGot==need){
			return true;
		}
	}
	return false;
}

function log(text){
	let log_before = fs.readFileSync(log_path,"utf8");
	let a = new Date(+new Date());
	let month = months[a.getMonth()];
	let date = a.getDate();
	let hour = a.getHours();
	let min = a.getMinutes();
	let EndDate = date + ' ' + month + ', ' + hour + ':' + min ;
	fs.writeFileSync(log_path,log_before+"\n"+EndDate+" ::: "+text)
}

function begins(str,beg){
	if(str.length>=beg.length){
		if(same(str.substr(0,beg.length),beg)){
			return true;
		}
	}
	return false;
}
