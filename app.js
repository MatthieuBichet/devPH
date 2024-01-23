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
const { platform } = process;
const locale = path[platform === `win32` ? `win32` : `posix`];


var cheminFichier = config.get("cheminFichier");
var cheminFichierNor = cheminFichier.split(path.sep).join(locale.sep);


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
        readDocsPR = readDocsPR.filter(el => el.path == queryFolder);
        readDocsPR.forEach(el => el.name.toLowerCase());
        //readDoc = docsPR.filter(el => {return el.path == queryFolder})
        //readDoc = readDoc.map(word =>{return word.name.toLowerCase();});
        
      
    }
    else
    {
      readDocsPR = docsPR;

    }
    if(typeof queryName ==='string')
    {
      readDocsPR = readDocsPR.filter(word=> word.name.includes(queryName.toLowerCase()));

    }
    //if(typeof )
    //verifier que la query soit non nulle
    res.render("template", {docs: readDocsPR, folders: readFolder, nameSearch: queryName, folderSearch: queryFolder});
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
  if(q.path.charAt(q.path.length-1)!=locale.sep)
        {
          q.path += locale.sep;
        }
  res.sendFile(q.path + q.name);
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
      folderLib.push(cheminFichierNor);
      for(const folder of folderResult)
      {
        folder.path = folder.path.split(path.sep).join(locale.sep);
        if(folder.path.charAt(folder.path.length-1)!=locale.sep)
        {
          folder.path += locale.sep;
        }
        folderLib.push(path.join(folder.path + (folder.name)));
      }
    
    for(const doc of docsResult)
    {
      docLib.push(doc.name);
    }
    for(const doc of docsPR)
    {
      doc.path = doc.path.split(path.sep).join(locale.sep);
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

 

