const mongoCont = require('mongodb');
const mongoObject = mongoCont.MongoClient;//声明mongodb客户端对象

/**模块内部变量声明**/
let mongoConnectMsgBody;//mongodb数据库连接信息体

/**反馈信息显示处理函数所需变量、对象声明**/
let errorMsgCollect;//错误信息存储点
let allowClientFetch = false;//允许客户端获取错误信息，默认为FALSE，不允许。
let allowServerFetch = false;//允许服务端获取错误信息，默认为FALSE，不允许。

let MsgDefaultDisplay = "";//默认显示信息实例端
/**反馈信息显示处理函数所需变量、对象声明**/

/**查询语句分析结果对象、变量声明**/
let finalAnalyzeValueObj;
/**查询语句分析结果对象、变量声明**/

/**最终结果存储器**/
let finalGetQueryValue;
/**最终结果存储器**/

/**模块内部变量声明**/


/****************************************************************************************************/


/**模块内部部分函数**/

function getDataLibraryURL() {
    if (Object.prototype.toString.call(mongoConnectMsgBody) === "[object Object]") {
        return "mongodb://" + mongoConnectMsgBody.hostname + ":" + mongoConnectMsgBody.port;
    } else {
        console.warn("未接收到传递过来的数据库连接信息");
        return null;
    }
}//URL数据获取器

function MessageProcess(MessageString, ProcWays) {
    if (ProcWays !== undefined && ProcWays !== '') {

    } else if (MsgDefaultDisplay !== undefined && MsgDefaultDisplay !== '') {
        ProcWays = MsgDefaultDisplay;
    } else {
        ProcWays = "client.server";
    }
    switch (ProcWays) {
        case "client.server":
            errorMsgCollect = MessageString;
            allowClientFetch = true;
            allowServerFetch = true;
            break;
        case "onlyclient":
            errorMsgCollect = MessageString;
            allowClientFetch = true;
            allowServerFetch = false;
            break;
        case "onlyserver":
            errorMsgCollect = MessageString;
            allowClientFetch = false;
            allowServerFetch = true;
            break;
        default:
            errorMsgCollect = "请传递正确的指令";
            allowClientFetch = true;
            allowServerFetch = true;
            break;
    }
}//反馈信息处理

class analyze {
    static readerStatementAnalyze = function (AnalyzeSources) {
        finalAnalyzeValueObj = null;
        finalAnalyzeValueObj = {};
        let begchar = AnalyzeSources.charAt(0);
        let endchar = AnalyzeSources.charAt(AnalyzeSources.length - 1);
        let encis = AnalyzeSources.indexOf(',');//逗号间隔符
        let encss = AnalyzeSources.indexOf(':');//冒号间隔符
        if (begchar === '{' && endchar === '}' && encis >= 4 && encis !== (AnalyzeSources.length - 1) && encss >= 0) {
            let SourceDataGroup = AnalyzeSources.split(',');//数据源分组处理
            let tempcompObj = {};//临时比较对象
            for (let sdgnum = 0; sdgnum < SourceDataGroup.length; sdgnum++) {
                let atrn;
                let atrv;
                atrn = SourceDataGroup[sdgnum].substr(1, SourceDataGroup[sdgnum].indexOf(':') - 1);
                atrv = SourceDataGroup[sdgnum].substr(SourceDataGroup[sdgnum].indexOf(':') + 2);
                atrv = atrv.substr(0, atrv.length - 2);
                tempcompObj[atrn] = atrv;
                for (let atrkeys in tempcompObj) {
                    switch (atrkeys) {
                        case "collname":
                            finalAnalyzeValueObj.collname = tempcompObj[atrkeys];
                            break;
                        case "find":
                            finalAnalyzeValueObj.find = {};
                            finalAnalyzeValueObj.find[tempcompObj[atrkeys].split(':')[0]] = tempcompObj[atrkeys].split(':')[1];
                            if (finalAnalyzeValueObj['sort'] === undefined) {
                                finalAnalyzeValueObj['sort'] = '';
                            }
                            if (finalAnalyzeValueObj['limit'] === undefined) {
                                finalAnalyzeValueObj['limit'] = 0;
                            }
                            if (finalAnalyzeValueObj['skip'] === undefined) {
                                finalAnalyzeValueObj['skip'] = 0;
                            }
                            break;
                        case "sort":
                            if (tempcompObj[atrkeys] !== '') {
                                finalAnalyzeValueObj.sort = {};
                                let sortVal;
                                if ((tempcompObj[atrkeys].split(':')[1] * 1) === (-1) || (tempcompObj[atrkeys].split(':')[1] * 1) === 1) {
                                    sortVal = (tempcompObj[atrkeys].split(':')[1] * 1);
                                    finalAnalyzeValueObj.sort[tempcompObj[atrkeys].split(':')[0]] = sortVal;
                                } else {
                                    finalAnalyzeValueObj.sort[tempcompObj[atrkeys].split(':')[0]] = 1;
                                }
                            } else {
                                finalAnalyzeValueObj.sort = '';
                            }
                            break;
                        case "limit":
                            if (tempcompObj[atrkeys] !== '') {
                                if ((tempcompObj[atrkeys] * 1) < 0) {
                                    finalAnalyzeValueObj.limit = 0;
                                } else {
                                    finalAnalyzeValueObj.limit = (tempcompObj[atrkeys] * 1);
                                }
                            } else {
                                finalAnalyzeValueObj.limit = 0;
                            }
                            break;
                        case "skip":
                            if (tempcompObj[atrkeys] !== '') {
                                if ((tempcompObj[atrkeys] * 1) < 0) {
                                    finalAnalyzeValueObj.skip = 0;
                                } else {
                                    finalAnalyzeValueObj.skip = (tempcompObj[atrkeys] * 1);
                                }
                            } else {
                                finalAnalyzeValueObj.skip = 0;
                            }
                            break;
                        default:
                            MessageProcess("出现无法检测的属性，无法分析！");
                            finalAnalyzeValueObj = null;
                            return;
                    }
                }
            }
        } else {
            MessageProcess("源数据格式不对。");
        }
    }
    static insertStatementAnalyze = function () {
        finalAnalyzeValueObj = null;
        finalAnalyzeValueObj = {};
        if (arguments.length === 2) {
            for (let InsertNum = 0; InsertNum < arguments.length; InsertNum++) {
                try {
                    if (Object.prototype.toString.call(arguments[InsertNum]) === '[object Object]') {
                        for (let attrName in arguments[InsertNum]) {
                            if (arguments[InsertNum][attrName] !== undefined) {
                                switch (attrName) {
                                    case "collname":
                                        finalAnalyzeValueObj.collname = arguments[InsertNum][attrName];
                                        break;
                                    case "insert":
                                        if (Object.prototype.toString.call(arguments[InsertNum][attrName]) === '[object Object]') {
                                            finalAnalyzeValueObj.insert = arguments[InsertNum][attrName];
                                        } else if (Object.prototype.toString.call(arguments[InsertNum][attrName]) === '[object Array]') {
                                            finalAnalyzeValueObj.insert = arguments[InsertNum][attrName];
                                        } else if (Object.prototype.toString.call(arguments[InsertNum][attrName]) === '[object String]') {
                                            let begchar = arguments[InsertNum][attrName].charAt(0);
                                            let endchar = arguments[InsertNum][attrName].charAt(arguments[InsertNum][attrName].length - 1);
                                            let encis = arguments[InsertNum][attrName].indexOf(',');//逗号间隔符
                                            let encss = arguments[InsertNum][attrName].indexOf(':');//冒号间隔符
                                            if (begchar === '{' && endchar === '}' && encss > 1) {
                                                if (encis !== (-1)) {
                                                    let extOne = arguments[InsertNum][attrName].split(',');
                                                    finalAnalyzeValueObj.insert = new Array(extOne.length);
                                                    for (let ii = 0; ii < extOne.length; ii++) {
                                                        finalAnalyzeValueObj.insert[ii] = {};
                                                        let ffGroup = extOne[ii].split(':');
                                                        ffGroup[0] = ffGroup[0].substr(1);
                                                        ffGroup[1] = ffGroup[1].substr(0, ffGroup[1].length - 1);
                                                        finalAnalyzeValueObj.insert[ii][ffGroup[0]] = ffGroup[1];
                                                    }
                                                } else {
                                                    let extTwo = arguments[InsertNum][attrName].substr(1, arguments[InsertNum][attrName].length - 2);
                                                    extTwo = extTwo.split(':');
                                                    finalAnalyzeValueObj.insert = {};
                                                    finalAnalyzeValueObj.insert[extTwo[0]] = extTwo[1];
                                                }
                                            } else {
                                                throw new Error("要插入的数据字符串格式错误！");
                                            }
                                        } else {
                                            throw new Error("要插入的数据仅支持对象或数组或字符串");
                                        }
                                        break;
                                    default:
                                        throw new Error("出现尚未支持或错误的属性名，分析引擎无法分析！");
                                }
                            } else {
                                throw new Error("出现未知的属性名，分析引擎无法分析！");
                            }
                        }
                    } else if (Object.prototype.toString.call(arguments[InsertNum]) === '[object String]') {
                        let begchar = arguments[InsertNum].charAt(0);
                        let endchar = arguments[InsertNum].charAt(arguments[InsertNum].length - 1);
                        let encis = arguments[InsertNum].indexOf(',');//逗号间隔符
                        let encss = arguments[InsertNum].indexOf(':');//冒号间隔符
                        if (begchar === '{' && endchar === '}' && encss > 1) {
                            let tmpExtOne;

                            if(InsertNum===1){
                                if(encis>4){
                                    finalAnalyzeValueObj.insert=[];
                                    tmpExtOne=arguments[InsertNum].split(',');
                                    for(let gItem=0;gItem<tmpExtOne.length;gItem++){
                                        let cuts=tmpExtOne[gItem].substr(1,tmpExtOne[gItem].length-2);
                                        cuts=cuts.split(':');
                                        let tmpObj={};
                                        tmpObj[cuts[0]]=cuts[1];
                                        finalAnalyzeValueObj.insert[gItem]=tmpObj;
                                    }
                                }else{
                                    tmpExtOne=arguments[InsertNum];
                                    let sings=tmpExtOne.substr(1,tmpExtOne.length-2);
                                    sings=sings.split(':');
                                    finalAnalyzeValueObj.insert={};
                                    finalAnalyzeValueObj.insert[sings[0]]=sings[1];
                                }
                            }else if(InsertNum===0){
                                tmpExtOne = arguments[InsertNum].substr(1, arguments[InsertNum].length - 2);
                                tmpExtOne = tmpExtOne.split(':');
                                finalAnalyzeValueObj[tmpExtOne[0]]=tmpExtOne[1];
                            }else{
                                throw new Error("传递的形参过多！");
                            }
                        } else {
                            throw new Error("字符串内容格式错误！");
                        }
                    } else if (Object.prototype.toString.call(arguments[InsertNum]) === '[object Array]') {
                        finalAnalyzeValueObj.insert =[];
                        let finArr=0;
                        for (let arrcout = 0; arrcout < arguments[InsertNum].length; arrcout++) {
                            if(arguments[InsertNum][arrcout]!==undefined){
                                finalAnalyzeValueObj.insert[finArr]='';
                            }
                            if (Object.prototype.toString.call(arguments[InsertNum][arrcout]) === '[object Object]') {

                            } else if (Object.prototype.toString.call(arguments[InsertNum][arrcout]) === '[object String]') {
                                let begchar = arguments[InsertNum][arrcout].charAt(0);
                                let endchar = arguments[InsertNum][arrcout].charAt(arguments[InsertNum][arrcout].length - 1);
                                let encss = arguments[InsertNum][arrcout].indexOf(':');//冒号间隔符
                                if (begchar === '{' && endchar === '}' && encss > 1) {
                                    if (arguments[InsertNum].length > 1) {
                                        if (arguments[InsertNum][arrcout] !== undefined) {
                                            let extOne = arguments[InsertNum][arrcout];
                                            extOne = extOne.substr(1, extOne.length - 2);
                                            extOne = extOne.split(':');
                                            finalAnalyzeValueObj.insert[arrcout] = {};
                                            finalAnalyzeValueObj.insert[arrcout][extOne[0]] = extOne[1];
                                        }
                                    } else {
                                        let extTwo = arguments[InsertNum].substr(1, arguments[InsertNum].length - 2);
                                        extTwo = extTwo.split(':');
                                        finalAnalyzeValueObj.insert = {};
                                        finalAnalyzeValueObj.insert[extTwo[0]] = extTwo[1];
                                    }
                                } else {
                                    throw new Error("要插入的数据字符串格式错误！");
                                }
                            } else if (arguments[InsertNum][arrcout] === undefined) {
                                MessageProcess("发现内容为空的数组块，自动跳过。");
                            } else {
                                throw new Error("数组内仅能包含对象或字符串，不能为其他的内容！");
                            }
                            finArr++;
                        }
                    } else {
                        throw new Error('传递过来的数据格式错误，仅能接受对象或字符串，且要插入的数据仅支持数组、对象、字符串格式！');
                    }
                } catch (e) {
                    MessageProcess(e.message);
                }
            }
        } else {
            MessageProcess("请传递两个形参，第一个是数据集合名，第二个是要插入数据表集合的数据！");
        }
    }
}//分析引擎

class ExecuteEngine {
    static readerDataOperate = async function () {
        finalGetQueryValue = "";
        await mongoObject.connect(getDataLibraryURL(), function (err, dbs) {
            dbs.db(mongoConnectMsgBody.dataBaseName).collection(finalAnalyzeValueObj.collname).find(finalAnalyzeValueObj.find).sort(finalAnalyzeValueObj.sort).limit(finalAnalyzeValueObj.limit).skip(finalAnalyzeValueObj.skip).toArray((err, getQueryValues) => {
                finalGetQueryValue = getQueryValues;
                dbs.close();
            });
        });
    }
    static insertDataOperate = async function () {
        finalGetQueryValue = "";
        await mongoObject.connect(getDataLibraryURL(), function (err, dbs) {
            if (Object.prototype.toString.call(finalAnalyzeValueObj.insert) === '[object Object]') {
                dbs.db(mongoConnectMsgBody.dataBaseName).collection(finalAnalyzeValueObj.collname).insertOne(finalAnalyzeValueObj.insert, function (err, res) {
                    if (err) {
                        MessageProcess("插入数据失败");
                    } else {
                        MessageProcess("插入" + res.insertedCount + "条数据成功");
                    }
                    dbs.close();
                });
            } else if (Object.prototype.toString.call(finalAnalyzeValueObj.insert) === '[object Array]') {
                dbs.db(mongoConnectMsgBody.dataBaseName).collection(finalAnalyzeValueObj.collname).insertMany(finalAnalyzeValueObj.insert, function (err, res) {
                    if (err) {
                        MessageProcess("插入数据失败");
                    } else {
                        MessageProcess("插入数据成功，插入的数据量为：" + res.insertedCount + "条");
                    }
                    dbs.close();
                });
            } else {
                MessageProcess("请传递对象或对象数组");
            }
        });
    }
    static updateDataOperate = async function () {

    }
    static removeDataOperate = async function () {

    }
}//执行引擎

/**模块内部部分函数**/


/**对外公开部分函数**/
function mongoConnectMsg(ConnectMsg) {
    mongoConnectMsgBody = {};
    if (Object.prototype.toString.call(ConnectMsg) === "[object Object]" || Object.prototype.toString.call(ConnectMsg) === "[object String]") {
        switch (Object.prototype.toString.call(ConnectMsg)) {
            case "[object Object]":
                for (let AtrName in ConnectMsg) {
                    if (ConnectMsg[AtrName] !== "" && ConnectMsg[AtrName] !== null && ConnectMsg[AtrName] !== undefined) {
                        switch (AtrName) {
                            case "hostname":
                                mongoConnectMsgBody.hostname = ConnectMsg[AtrName];
                                break;
                            case "port":
                                mongoConnectMsgBody.port = ConnectMsg[AtrName];
                                break;
                            case "dataBaseName":
                                mongoConnectMsgBody.dataBaseName = ConnectMsg[AtrName];
                                break;
                            default:
                                mongoConnectMsgBody = null;
                                MessageProcess("存在未知的属性或属性名未严格区分大小写", "client.server");
                                throw new Error();
                        }
                    } else {
                        mongoConnectMsgBody = null;
                        console.log("检测到一个属性的值为空，不能继续");
                        break;
                    }
                }
                break;
            case "[object String]":
                if (ConnectMsg.charAt(0) === "{" && ConnectMsg.charAt(ConnectMsg.length - 1) === "}" && (ConnectMsg.indexOf(',') > -1) && (ConnectMsg.indexOf('=') > -1)) {
                    let dataGroup = ConnectMsg.split(',');
                    for (let dgCou = 0; dgCou < dataGroup.length; dgCou++) {
                        if (dataGroup[dgCou].charAt(0) === "{" && dataGroup[dgCou].charAt(dataGroup[dgCou].length - 1) === "}") {
                            let extRcMsg = dataGroup[dgCou].substr(1, dataGroup[dgCou].length - 2);
                            if (extRcMsg.indexOf('=') > 0) {
                                let smGroup = extRcMsg.split('=');
                                switch (smGroup[0]) {
                                    case "hostname":
                                        mongoConnectMsgBody[smGroup[0]] = smGroup[1];
                                        break;
                                    case "port":
                                        mongoConnectMsgBody[smGroup[0]] = smGroup[1];
                                        break;
                                    case "dataBaseName":
                                        mongoConnectMsgBody[smGroup[0]] = smGroup[1];
                                        break;
                                    default:
                                        console.log("存在未知的标识，不能继续。");
                                        mongoConnectMsgBody = null;//直接销毁信息体
                                        break;
                                }
                            } else {
                                console.log("字符串内容格式不对");
                                mongoConnectMsgBody = null;//直接销毁信息体
                            }
                        } else {
                            console.log("字符串内容格式不对");
                            mongoConnectMsgBody = null;//直接销毁信息体
                            break;
                        }
                    }
                } else {
                    console.log("字符串内容格式不对");
                }
                break;
            default:
                console.log('你所传递的数据不是对象也不是字符串');
                break;
        }
    } else {
        console.log("形参ConnectMsg仅能接收特定格式的对象或特定格式的字符串");
    }
}//连接信息接收器

async function singleReader() {
    if (arguments.length === 0 && Object.prototype.toString.call(mongoConnectMsgBody) !== '[object Object]') {
        MessageProcess("请给单次查询函数（singleQuery）传递两个形参，第一个是数据库连接信息，第二个是要查询数据库的语句！另外也可以调用singleQuery之前，先调用mongoConnectMsg函数接收要传递数据库连接信息，再往singleQuery传入查询语句！");
    } else if (arguments.length !== 0 && Object.prototype.toString.call(mongoConnectMsgBody) !== '[object Object]') {
        if (arguments.length === 2) {
            mongoConnectMsgBody(arguments[0]);
            analyze.readerStatementAnalyze(arguments[1]);
            await ExecuteEngine.readerDataOperate();
            //执行查询代码
        } else {
            MessageProcess("传递的形参个数过多或者过少，仅能接收两个形参，第一个是数据库连接信息，第二个是要查询数据库的语句！");
        }
    } else if (arguments.length === 1 && Object.prototype.toString.call(mongoConnectMsgBody) === '[object Object]') {
        analyze.readerStatementAnalyze(arguments[0]);
        await ExecuteEngine.readerDataOperate();
        //执行查询代码
    } else if (arguments.length !== 1 && Object.prototype.toString.call(mongoConnectMsgBody) === '[object Object]') {
        MessageProcess("形参参数过多！");
    } else {
        MessageProcess("形参参数过多！或者调用singleQuery之前没有调用mongoConnectMsg函数！");
    }
}//简单查询函数

async function singleInsert() {
    if (arguments.length === 0 && Object.prototype.toString.call(mongoConnectMsgBody) !== '[object Object]') {
        MessageProcess("请给单次查询函数（singleInsert）传递三个形参，第一个是数据库连接信息，第二个是指定要插入的数据表的集合名，第三个是要插入数据表的数据！另外也可以调用singleInsert之前，先调用mongoConnectMsg函数接收要传递数据库连接信息，再往singleInsert传入指定的数据表集合名和要插入的数据！");
    } else if (arguments.length !== 0 && Object.prototype.toString.call(mongoConnectMsgBody) !== '[object Object]') {
        if (arguments.length === 3) {
            mongoConnectMsgBody(arguments[0]);
            analyze.insertStatementAnalyze(arguments[1], arguments[2]);
            await ExecuteEngine.insertDataOperate();
            //执行查询代码
        } else {
            MessageProcess("传递的形参个数过多或者过少，仅能接收三个形参，第一个是数据库连接信息，第二个是指定要插入的数据表的集合名，第三个是要插入数据表的数据！");
        }
    } else if (arguments.length === 2 && Object.prototype.toString.call(mongoConnectMsgBody) === '[object Object]') {
        analyze.insertStatementAnalyze(arguments[0], arguments[1]);
        await ExecuteEngine.insertDataOperate();
        //执行查询代码
    } else if (arguments.length > 2 && Object.prototype.toString.call(mongoConnectMsgBody) === '[object Object]') {
        MessageProcess("形参参数过多！");
    } else {
        MessageProcess("形参参数过多或过少！或者调用singleInsert之前没有调用mongoConnectMsg函数！");
    }
}

class getMessageDisplayType {
    static both = "client.server";
    static onlyClient = "onlyclient";
    static onlyServer = "onlyserver";
}

function getMessageDisplay(MsgType = "client.server") {
    let getRetMsg;
    switch (MsgType) {
        case "client.server":
            if (allowClientFetch === true && allowServerFetch === true) {
                getRetMsg = errorMsgCollect;
                console.log("服务端:" + getRetMsg);
            } else {
                getRetMsg = "存储的错误信息所属类型与获取类型不符";
                console.log(getRetMsg);
            }
            break;
        case "onlyclient":
            if (allowClientFetch === true && allowServerFetch === false) {
                getRetMsg = errorMsgCollect;
            } else {
                getRetMsg = "存储的错误信息所属类型与获取类型不符";
                console.log(getRetMsg);
            }
            break;
        case "onlyserver":
            if (allowClientFetch === false && allowServerFetch === true) {
                getRetMsg = errorMsgCollect;
                console.log("服务端:" + getRetMsg);
            } else {
                getRetMsg = "存储的错误信息所属类型与获取类型不符";
                console.log(getRetMsg);
            }
            break;
        default:
            getRetMsg = "请填写要获取的错误信息类型";
            console.log(getRetMsg);
            return getRetMsg;
    }
    if (MsgType === "client.server" || MsgType === "onlyclient") {
        return "客户端:" + getRetMsg;
    }
}//获取并显示反馈信息
function setMessageDisplayDefault(TypeValue) {
    MsgDefaultDisplay = TypeValue;
}

function getFinalQueryValue() {
    return finalGetQueryValue;
}//输出最终查询结果

class mongoQueryOperateProcess extends ExecuteEngine {

}

/**对外公开部分函数**/

module.exports = {
    mongoConnectMsg,
    getMessageDisplay,
    setMessageDisplayDefault,
    singleReader,
    singleInsert,
    getFinalQueryValue,
    mongoQueryOperateProcess,
    getMessageDisplayType
}