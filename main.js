let http = require('http');
let fs = require('fs');
let url = require("url");

const templateHTML = (title, list, body) => {
    return `
        <!doctype html>
            <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    ${body}
                </body>
            </html>
    `
}

const templateList = (filelist) => {
    let list = `<ul>`;

    for(let i = 0; i < filelist.length;i++){
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    }
    list = list + `</ul>`

    return list
}

let app = http.createServer((request,response) => {
    let _url = request.url;
    let queryData = url.parse(_url, true).query;
    let pathname = url.parse(_url, true).pathname;

    if(pathname === "/"){
        if(queryData.id === undefined){

            fs.readdir('./data',(error, filelist) => {
                const title = "Welcome";
                const description = "Hello, Node.js";
                const list = templateList(filelist);

                const template = templateHTML(title, list, `<h2>${title}</h2>>${description}`);
                response.writeHead(200);
                response.end(template);
            })

        } else{
            fs.readdir('./data',(error, filelist) => {

                fs.readFile(`data/${queryData.id}`,"utf8",(err, description) => {
                    const title = queryData.id;
                    const list = templateList(filelist);
f
                    const template = templateHTML(title, list, `<h2>${title}</h2>>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            })
        }

    }else {
        response.writeHead(200);
        response.end("Not Found");
    }
});
app.listen(3100);