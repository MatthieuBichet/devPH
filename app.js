const express = require("express");
const config = require('config');
var fsp = require('fs/promises');
var url = require('url');
const app = express();
const path = require("path");
const { get } = require("http");
app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, 'views');
var cheminFichier = config.get("cheminFichier");
var docs = getFiles(cheminFichier);            //récup des fichiers async
var folders = getFolders(cheminFichier);  
var folderPaths =[];
var docLib =[];

app.get("", (req, res) => {
  
  var q = url.parse(req.url, true).query;
try{
  //array des dossiers traités
  var folderPaths = new Array();
  //array des fichiers traités
  var docLib = new Array();

     //récup des dossiers async
  docs.then(function(docsResult)
  {
    folders.then(function(folderResult)
    {
      for(const folder of folderResult){
      folderPaths.push(folder.path + (folder.name));
    }
    for(const doc of docsResult)
    {
      docLib.push(doc.name);
    }
    docLib = docLib.map(word =>{return word.toLowerCase();});
    if(typeof q.name ==='string')
  {
    docLib = docLib.filter(word=> word.includes(q.name.toLowerCase()));
  }
  else
  {
    
  }
    //verifier que la query soit non nulle
  res.render("template", {docs: docLib, folders: folderPaths});
  res.statusCode = 200;
  });
  });
  }
catch(error)
  {
    console.log(error.toString());
    res.end(error);
    res.statusCode = 404;
  }
})



app.get("/opendoc", (req, res) =>{
  res.statusCode = 200;
  var q = url.parse(req.url, true).query;
  //pareil pour l'envoi du fichier
  //res.sendFile("/var/www/devph/docs/" + q.name);
  res.sendFile(cheminFichier + q.name);
})

/*app.get("/folderView", (req, res) =>{
  res.statusCode=200;
  //var q = ;

  
})*/

app.get("/refresh", (req, res)=>{
  docs = getFiles(cheminFichier);            //récup des fichiers async
  folders = getFolders(cheminFichier);
  res.redirect("/");
})

app.use((req, res) => {
    res.statusCode = 404;
    res.end("404 - page not found");
});

app.listen(3000, () => {

    console.log("Application started on port 3000");
});

async function getFiles(dir) {
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((docs) =>{
  docs = docs.filter(dirent => dirent.isFile());
  return docs;
})
}

async function getFolders(dir){
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((folders) =>{
    folders = folders.filter(dirent => dirent.isDirectory());
    return folders;
  })
  }

 

