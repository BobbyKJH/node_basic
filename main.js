const http = require('http');
const fs = require('fs');
const url = require("url");
const qs = require("querystring")

const templateHTML = (title, list, body) => {
    return `
        <!doctype html>
            <html lang="ko">
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    <a href="/create">생성</a>
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
    console.log(pathname);
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

                    const template = templateHTML(title, list, `<h2>${title}</h2>>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            })
        }

    } else if(pathname === "/create"){

        fs.readdir('./data',(error, filelist) => {
            const title = "WEB - CREATE";
            const list = templateList(filelist);

            const template = templateHTML(title, list, `
                <form action="http://localhost:3100/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"/></p>
                <div>
                    <textarea type="text" name="description" placeholder="description"></textarea>
                </div>
                <input type="submit">생성</input>
                </form>
            `);
            response.writeHead(200);
            response.end(template);
        })
    } else if(pathname === "/create_process"){
        let body = "";
        request.on('data', (data) => {
            body = body + data;
        });

        request.on("end", () => {
            const post = qs.parse(body);
            const title = post.title;
            const description = post.description
            console.log(description);
        })
        response.writeHead(200);
        response.end('success');
    }
    else {
        response.writeHead(200);
        response.end("Not Found");
    }
});
app.listen(3100);