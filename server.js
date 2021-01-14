// const webser = require('./website');
const dataLibs = require('./datalibrary');

//Object.prototype.toString.call(mongoConnectMsgBody) === "[object Object]"

// let webInterface={};//网站接口集合对象，所有的网站接口的功能实现函数都将集合于此。

// webInterface['/readdatalibrary']=function(req,res){
//     let getRequestObject=req.query;
//     let detRequestObject=false;
//     for(let attrName in getRequestObject){
//         detRequestObject=true;
//         console.log(attrName);
//     }
//     if(detRequestObject===false){
//         res.send('请传递需要参数',200);
//     }else{
//         res.send('OK，测试成功',200);
//     }
//     res.end();
// };

// webser.onLauncher("./dist",8080,'index.html');
// webser.extraImportRoute(webInterface);


// let dgf = {
//     hostname: "libertylife.wicp.net",
//     port: "51071",
//     dataBaseName: "ts"
// };
// dataLibs.mongoContents.mongoConnectMsg(dgf);

// let dfss = new Array(3);
// dfss[0] = '{name:mikechen}';
// dfss[1] = '{name:iTOC co.Ltd}';
// dfss[2] = '{name:CEO}';
// let opld={insert:'{name:Next Prodect},{name:Yes Product Success Build}'};
// let dcvx={insert:{name:"mikechen CEO"}};

// let dffc = {insert: new Array(3)};
// dffc.insert[0] = {name:'mikechen'};
// dffc.insert[1] = {name:'iTOC co.Ltd'};
// dffc.insert[2] = {name:'CEO'};

// let dffc = {insert: new Array(3)};
// dffc.insert[0] = '{name:mikechen}';
// dffc.insert[1] = '{name:iTOC co.Ltd}';
// dffc.insert[2] = '{name:CEO}';

// dataLibs.mongoContents.singleInsert("{collname:TG}", '{name:mikechen},{name:iTOC co.Ltd},{name:CEO}');//第一种插入方法，纯字符串
// dataLibs.mongoContents.singleInsert("{collname:TG}",opld);//第二种插入方法，对象属性集合
// dataLibs.mongoContents.singleInsert("{collname:TG}",dfss);//第三种插入方法，字符串数组集合
// dataLibs.mongoContents.singleInsert({collname:'TG'},dcvx);//第四种插入方法，数据对象内容集合
// dataLibs.mongoContents.singleInsert({collname:'TG'},dffc);//第五种插入方法，数据字符串内容集合

// let msgss = setTimeout(function () {
//     console.log(dataLibs.mongoContents.getMessageDisplay());
//     clearTimeout(msgss);
// }, 1000);
// let sfd = setTimeout(function () {
//     console.log(dataLibs.mongoContents.getFinalQueryValue());
//     clearTimeout(sfd);
// }, 1000);

let dgf = [];
dgf[0] = "{where: {name: cvb}, updatestring: {name: mikechen}}";
dgf[1] = "{where: {name: saaa}, updatestring: {name: mikechen}}";
dgf[2] = "{where: {name: dwq}, updatestring: {name: mikechen}}";
let fdx = {};
fdx.update = dgf;
// fdx.update = "";
// fdx.updateway = "single";
// analyze.updateStatementAnalyze({collname: 'TG'}, fdx);


dataLibs.mongoContents.devtest("{collname:\"TG\"}",fdx);