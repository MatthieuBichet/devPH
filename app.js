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
var cheminFichierNor = path.normalize(cheminFichier);
var docsPR = [];           
var foldersPR = [];  
var folderLib =[];
var docLib =[];
initDB();

app.get("", (req, res) => {
  
var queryName = url.parse(req.url, true).query.name;
var queryFolder = url.parse(req.url, true).query.folder;
var readDoc= [];
var readFolder = folderLib;
var readDocsPR =[];

try{

    if(queryFolder != cheminFichierNor && typeof queryFolder ==='string')
    {
        /*for(const doc of docsPR)
        {
          if(doc.path == queryFolder)
          {
            readDoc.push(doc.name);
          }

        
        }*/
        readDocsPR = docsPR;
        readDoc = docsPR.filter(el => {return el.path == queryFolder})
        readDoc = readDoc.map(word =>{return word.name.toLowerCase();});
        
      
    }
    else
    {
      readDoc = docLib;

    }
    if(typeof queryName ==='string')
    {
      readDoc = readDoc.filter(word=> word.includes(queryName.toLowerCase()));
    }
    else
    {
      
    }
    //if(typeof )
    //verifier que la query soit non nulle
    res.render("template", {docs: readDoc, folders: readFolder});
    res.statusCode = 200;

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
function initDB()
{
  folderLib.length=0;
  docLib.length=0;
  var docs = getFiles(cheminFichier);            //récup des fichiers async
  var folders = getFolders(cheminFichier);
  docs.then(function(docsResult)
  {
    folders.then(function(folderResult)
    {
      docsPR = docsResult;
      foldersPR = folderResult;
      folderLib.push(path.normalize(cheminFichier));
      for(const folder of folderResult)
      {
        folderLib.push(path.join(folder.path.normalize() + (folder.name)));
      }
    
    for(const doc of docsResult)
    {
      docLib.push(doc.name);
    }
    for(const doc of docsPR)
    {
      doc.path = path.normalize(doc.path);
    }
    docLib = docLib.map(word =>{return word.toLowerCase();});
  });
});

}
app.get("/refresh", (req, res)=>{
  initDB();
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
  ((recherche) =>{
  recherche = recherche.filter(dirent => dirent.isFile());
  return recherche;
})
}

async function getFolders(dir){
  return await fsp.readdir(dir, { recursive: true, withFileTypes: true }).then
  ((recherche) =>{
    recherche = recherche.filter(dirent => dirent.isDirectory());
    return recherche;
    
  })
  }

 

