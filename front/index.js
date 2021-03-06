var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var rq = require('request-promise');
var querystring = require('querystring');
var fs = require('fs');
var request = require('request');
var path = require('path');

var http = require('http');
var querystring = require('querystring');

const api_key = 'bxry2NsPLpWdl-zL9SZgqBHqslXxbM1p';
const api_secret = 'XdJtVVbqEg4EzwOofqWRiWl_YiZSV_QT';
const faceset_token = "4d05c631255dd4bc378586224ef58864";

var exec = require('child_process').exec;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/search', function (req, res) {
    var img1_url = req.body.img1;
    // // post=api_key+api_secret+image_base64+face_set
    // var post_data = {

    // };
    // var options = {
    //     uri: 'https://api-cn.faceplusplus.com/facepp/v3/search',
    //     method: 'POST',
    //     form: {
    //         api_key: api_key,
    //         api_secret: api_secret,
    //         image_base64: img1_base64,
    //         faceset_token: faceset_token
    //     }
    // };
    // rq(options).then(result => {
    //     console.log(result);
    //     result = JSON.parse(result);
    //     var ID = result.results[0].user_id;
    //     var name1 = ID2Name(ID);

    //     exec('python3 witharg.py sch ' + ID + ' ', function (error, stdout, stderr) {
    //         console.log(stdout);
    //         //TODO:decode id and relation
    //         res.end(stdout);
    //     });
    // }).catch(err => {
    //     console.log(err);
    // });
    //result

    img2ID(img1_url).then(user_id => {
        exec('python3 witharg.py sch ' + user_id + ' ', function (error, stdout, stderr) {
            console.log(stdout);
            //TODO:decode id and relation
            res.write(stdout);
            res.end();
        });
    })
});

//crypt    TODO:need add salt
//const
var salt = 'alanqa';
//encrypt
function ID2Name(user_ID) {
    var name1 = '';
    for (var i = 0; i < user_ID.length; i++) {
        name1 += String.fromCharCode((user_ID.charCodeAt(i) - 97 + 15) % 26 + 97);
    }
    return name1;
}
//decrypt
function Name2ID(name) {
    var ID1 = '';
    for (var i = 0; i < name.length; i++) {
        ID1 += String.fromCharCode((name.charCodeAt(i) - 97 + 11) % 26 + 97);
    }
    console.log(ID1);
    return ID1;
}
//end crypt

app.post('/insert', function (req, res) {
    var img1 = req.body.img1;
    var img2 = req.body.img2;
    var name1 = req.body.name1;
    var name2 = req.body.name2;
    var rel = Name2ID(req.body.rel);

    // Promise.all([searchInSet(img1), searchInSet(img2)]).then(resultList => {
    //     console.log(resultList);
    //     //TODO:所有id都拿到了

    // exec('python3 witharg.py add ' + resultList[0] + ' ' + resultList[1] + ' ' + rel + ' ', function (error, stdout, stderr) {
    //     console.log(error);
    //     console.log(stdout);
    //     console.log(stderr);
    //     res.end(stdout);
    // });

    // }).catch(err => {
    //     console.log('face api error: ' + err);
    //     Promise.all([addIntoSet(img1, name1), addIntoSet(img2, name2)]).then(resultList => {//分别获取到两个人user_id且都添加到set内
    //         console.log(resultList);
    //         //TODO:to chain
    //         //var exec = require('child_process').exec;
    //         exec('python3 witharg.py add ' + resultList[0] + ' ' + resultList[1] + ' ' + rel + ' ', function (error, stdout, stderr) {
    //             console.log(stdout);
    //             res.end(stdout);
    //         });
    //     });
    // })
    Promise.all([img2ID(img1, name1), img2ID(img2, name2)]).then(resultList => {
        exec('python3 witharg.py add ' + resultList[0] + ' ' + resultList[1] + ' ' + rel + ' ', function (error, stdout, stderr) {
            console.log(error);
            console.log(stdout);
            console.log(stderr);
            res.write(stdout);
            res.end();
        });
    }).catch(err => {
        console.log(err);
    })
});

app.get('/clearSet', function (req, res) {
    /*------获取set列表------*/
    var content = {
        api_key: api_key,
        api_secret: api_secret,
        faceset_token: faceset_token,
        face_tokens: 'RemoveAllFaceTokens'
    }
    var option_del = {
        uri: 'https://api-cn.faceplusplus.com/facepp/v3/faceset/removeface',
        method: 'POST',
        form: content
    }
    rq(option_del).then(result => {
        console.log(result);
    })
});

app.get('/getAll', function (req, res) {
    var content = {
        api_key: api_key,
        api_secret: api_secret,
        faceset_token: faceset_token
    }
    var option_get = {
        uri: 'https://api-cn.faceplusplus.com/facepp/v3/faceset/getdetail',
        method: 'POST',
        form: content
    }
    rq(option_get).then(result => {
        console.log(result.toString());
        result = JSON.parse(result);
        for (var i = 0; i < result.face_tokens.length; i++) {
            var content = {
                api_key: api_key,
                api_secret: api_secret,
                face_token: result.face_tokens[i],
                faceset_token: faceset_token
            }
            var option_search = {
                uri: 'https://api-cn.faceplusplus.com/facepp/v3/search',
                method: 'POST',
                form: content
            }
            rq(option_search).then(fresult => {
                fresult = JSON.parse(fresult);
                console.log(fresult.results[0].user_id);
            });
        }
    })
});

//在set中查找base64图片，没有则添加
function searchInSet(imgbase64) {
    return new Promise(function (resolve, reject) {
        var content = {
            api_key: api_key,
            api_secret: api_secret,
            image_base64: imgbase64,
            faceset_token: faceset_token
        }
        var option_search = {
            uri: 'https://api-cn.faceplusplus.com/facepp/v3/search',
            method: 'POST',
            form: content
        }
        rq(option_search).then(result => {
            result = JSON.parse(result);
            console.log('search result:' + result.toString());
            if (result.results[0].confidence < 70) {//置信度最高的也不可信
                console.log(name1 + 'conf:' + (result.results[0].confidence));
                addIntoSet(img1, name1).then(id => {
                    resolve(id);
                });
            }
            else {
                resolve(result.results[0].user_id);
            }
        }).catch(err => {
            reject(err);
        });
    })
}

/*没注册在set里面的先添加到set */
function addIntoSet(imgbase64, name) {
    return new Promise(function (resolve, reject) {
        var content = {
            api_key: api_key,
            api_secret: api_secret,
            image_base64: imgbase64,
        }
        var option_detect = {
            uri: 'https://api-cn.faceplusplus.com/facepp/v3/detect',
            method: 'POST',
            form: content
        }
        rq(option_detect).then(result => {//检测人脸
            result = JSON.parse(result);
            var token = result.faces[0].face_token;//只有一个人
            var user_id = getUserID(name);
            console.log(user_id);
            var content = {
                api_key: api_key,
                api_secret: api_secret,
                face_token: token,
                user_id: user_id
            }
            var option_set = {
                uri: 'https://api-cn.faceplusplus.com/facepp/v3/face/setuserid',
                method: 'POST',
                form: content
            }
            rq(option_set).then(result => {//设置了user_id
                result = JSON.parse(result);
                var content = {
                    api_key: api_key,
                    api_secret: api_secret,
                    faceset_token: faceset_token,
                    face_tokens: token
                }
                var option_add = {
                    uri: 'https://api-cn.faceplusplus.com/facepp/v3/faceset/addface',
                    method: 'POST',
                    form: content
                }
                rq(option_add).then(result => {//添加到faceset
                    resolve(user_id);
                });
            });
        });
    })
}

function getUserID(name) {
    var result_name = '';
    for (var i = 0; i < name.length; i++) {
        var at = name.charCodeAt(i);
        at = (at - 97 + 11) % 26;
        name[i] = String.fromCharCode(at + 97);//a~z only
        result_name += String.fromCharCode(at + 97);
    }
    console.log(result_name);
    return result_name;
}

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

//azure API here
//const
var api_key_azure = '3f476c6650914d70abece1702871b6d6';
var server_loc = 'westcentralus';
var uri_str = '.api.cognitive.microsoft.com/face/v1.0/';
var personGroupID = 'ohmypersongroup';  //TODO: fill this after created
var Threshold = 0.7; //TODO: change this when needed
var DebugLogOutput = 1;
//func
/*获取faceID */
function detect(imgurl) { //use detect API, return faceID
    return new Promise(function (resolve, reject) {
        var content_azure_detect = {
            url: imgurl
        }
        var header_azure_detect = {
            'Ocp-Apim-Subscription-Key': api_key_azure,
            'content-type': 'application/json'
        }
        var option_detect_azure = {
            uri: 'https://' + server_loc + uri_str + 'detect',
            method: 'POST',
            headers: header_azure_detect,
            body: content_azure_detect,
            json:true
        }
        //send req
        rq(option_detect_azure).then(result => {
            //result = JSON.parse(result);
            //debugger
            if (DebugLogOutput == 1) {
                console.log(result);
            }
            //maybe func here
            resolve(result[0].faceId);
        }).catch(err => {
            console.log('detect err' + err);
        });
    })
}
/*查找 */
function identify(imgurl, name, faceID) { //use identify API, if find, return id; if not, return 'No'
    return new Promise(function (resolve, reject) {
        var content_azure_identify = {
            faceIds: [faceID],
            personGroupId: personGroupID,
            maxNumOfCandidatesReturned: 1
        }
        var header_azure_identify = {
            'Ocp-Apim-Subscription-Key': api_key_azure
        }
        var option_id_azure = {
            uri: 'https://' + server_loc + uri_str + 'identify',
            method: 'POST',
            headers: header_azure_identify,
            body: content_azure_identify,
            json:true
        }
        console.log(JSON.stringify(option_id_azure));
        //send req
        rq(option_id_azure).then(result => {
            //result = JSON.parse(result);
            //debugger
            if (DebugLogOutput == 1) {
                console.log(result);
            }
            //maybe func here
            if (result[0].candidates[0] && result[0].candidates[0].confidence > Threshold) {
                resolve(result[0].candidates[0].personId);
            }
            else {
                //resolve('No');
                createPerson(name).then(pid => {
                    addFace(imgurl, pid).then(() => {
                        var headers = {
                            'Ocp-Apim-Subscription-Key': api_key_azure
                        }
                        var option_train = {
                            uri: 'https://' + server_loc + uri_str +'persongroups/' + personGroupID +  '/train',
                            method: 'POST',
                            headers: headers,
                            json:true
                        }
                        rq(option_train).then();
                        resolve(pid);
                    })
                }).catch(err => {
                    console.log('err create' + err);
                })
            }
        }).catch(err => {
            console.log('identify err' + err);
        });
    })
}
/*没注册在group里面的,先添加到group */
function createPerson(name) { //use createPerson API, return personID
    return new Promise(function (resolve, reject) {
        var id = Name2ID(name);
        var content_azure_createperson = {
            name: id
            //userData:'describe'
        }
        var header_azure_createperson = {
            'Ocp-Apim-Subscription-Key': api_key_azure
        }
        var option_cp_azure = {
            uri: 'https://' + server_loc + uri_str + 'persongroups/' + personGroupID + '/persons',
            method: 'POST',
            headers: header_azure_createperson,
            body: content_azure_createperson,
            json:true
        }
        //send req
        rq(option_cp_azure).then(result => {
            //result = JSON.parse(result);
            //debugger
            if (DebugLogOutput == 1) {
                console.log(result);
            }
            //maybe func here
            resolve(result.personId);
        }).catch(err => {
            console.log('create err');
        });
    })
}
/*已注册在group里面的,添加Face */
function addFace(imgurl, id) { //use addFace API
    return new Promise(function (resolve, reject) {
        var content_azure_addface = {
            url: imgurl
        }
        var header_azure_addface = {
            'Ocp-Apim-Subscription-Key': api_key_azure
        }
        var option_af_azure = {
            uri: 'https://' + server_loc + uri_str + 'persongroups/' + personGroupID + '/persons/' + id + '/persistedFaces',
            method: 'POST',
            headers: header_azure_addface,
            body: content_azure_addface,
            json:true
        }
        //send req
        rq(option_af_azure).then(result => {
            //result = JSON.parse(result);
            //debugger
            if (DebugLogOutput == 1) {
                console.log(result);
            }
            //maybe func here
            resolve();
        }).catch(err => {
            console.log('addFace err' + err);
        });
    })
}
/*personID转成name(user_id) */
function convert(personID) { //use addFace API
    return new Promise(function (resolve, reject) {
        var content_azure_convert = {
            //nothing here
        }
        var header_azure_convert = {
            'Ocp-Apim-Subscription-Key': api_key_azure
        }
        var option_convert_azure = {
            uri: 'https://' + server_loc + uri_str + 'persongroups/' + personGroupID + '/persons/' + personID,
            method: 'GET',
            headers: header_azure_convert,
            //body: content_azure_convert,
            json:true
        }
        //send req
        rq(option_convert_azure).then(result => {
            //result = JSON.parse(result);
            //debugger
            if (DebugLogOutput == 1) {
                console.log(result);
            }
            //maybe func here
            resolve(result.name);
        }).catch(err => {
            console.log('convert err' + err);
        });
    })
}
//func img2ID
function img2ID(imgurl, name) { //use addFace API, name can be an empty string
    return new Promise(function (resolve, reject) {
        detect(imgurl).then(faceid => {
            identify(imgurl, name, faceid).then(personid => {
                addFace(imgurl, personid).then(() => {
                    convert(personid).then(uID => {
                        console.log('finished');
                        resolve(uID);
                    })
                })
            })
        })
    })
    // var pID = identify(face_id);
    // if(pID == 'No'){
    //     pID = createPerson(name);
    // }
    // addFace(imgurl,pID);
    // //convert
    // var uID = convert(pID);
    // return uID;
}
//end azure API
