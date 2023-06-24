const http = require('http');
const fs = require('fs');
const url = require("url");
const qs = require("querystring")
const path = require("path");
const sanitizeHtml = require('sanitize-html');

const template = {
    HTML: (title, list, body, control) => {
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
                    
                    ${control}
                    
                    ${body}
                </body>
            </html>
    `
    },
    List: (filelist) => {
        let list = `<ul>`;

        for(let i = 0; i < filelist.length;i++){
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
        }
        list = list + `</ul>`

        return list
    }
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
                const list = template.List(filelist);

                const html = template.HTML(title, list,
                    `<h2>${title}</h2>>${description}`,
                    `<a href="/create">생성</a>`);
                response.writeHead(200);
                response.end(html);
            })

        } else{
            fs.readdir('./data',(error, filelist) => {
            const filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`,"utf8",(err, description) => {
                    const title = queryData.id;
                    const list = template.List(filelist);
                    const sanitizedTitle = sanitizeHtml(title);
                    const sanitizedDescription = sanitizeHtml(description, {
                        allowedTags: ["h1"]
                    })
                    const html = template.HTML(sanitizedTitle, list,
                    `<h2>${sanitizedTitle}</h2>>${sanitizedDescription}`,
                        `
                        <a href="/create">생성</a> 
                        <a href="/update?id=${sanitizedTitle}">수정</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                        </form>
                        `
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            })
        }

    } else if(pathname === "/create"){

        fs.readdir('./data',(error, filelist) => {
            const title = "WEB - CREATE";
            const list = template.List(filelist);

            const html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"/></p>
                    <div>
                        <textarea type="text" name="description" placeholder="description"></textarea>
                    </div>
                    <input type="submit"/>
                </form>
            `,'');
            response.writeHead(200);
            response.end(html);
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
            fs.writeFile(`data/${title}`, description, "utf8",() => {
                response.writeHead(302, {Location : `/?id=${title}`});
                response.end();
            })
        })

    } else if(pathname === `/update`){
        fs.readdir('./data',(error, filelist) => {
            const filteredId = path.parse(queryData.id).base;

            fs.readFile(`data/${filteredId}`,"utf8",(err, description) => {
                const title = queryData.id;
                const list = template.List(filelist);

                const html = template.HTML(title, list,
                  `
                    <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}"/>
                        <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
                        <div>
                            <textarea type="text" name="description" placeholder="description">${description}</textarea>
                        </div>
                        <input type="submit"/>
                    </form>
                `,
                `<a href="/create">생성</a> <a href="/update?id=${title}">수정</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        })
    } else if(pathname === "/update_process"){
        let body = "";
        request.on('data', (data) => {
            body = body + data;
        });

        request.on("end", () => {
            const post = qs.parse(body);
            const id = post.id
            const title = post.title;
            const description = post.description
            console.log(post);
            fs.rename(`data/${id}`, `data/${title}`, (err) => {
                fs.writeFile(`data/${title}`, description, "utf8",() => {
                    response.writeHead(302, {Location : `/?id=${title}`});
                    response.end();
                })
            });
        });
    }else if(pathname === "/delete_process"){
        let body = "";
        request.on('data', (data) => {
            body = body + data;
        });

        request.on("end", () => {
            const post = qs.parse(body);
            const id = post.id
            const filterdId = path.parse(id).base;
            fs.unlink(`data/${filterdId}`, (err) => {
                response.writeHead(302, {Location : `/`});
                response.end();
            })
        });
    }
    else {
        response.writeHead(200);
        response.end("Not Found");
    }
});
app.listen(3100);