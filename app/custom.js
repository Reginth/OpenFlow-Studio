
//////////////////////////////////////////////
// VARIABILI E FUNZIONI DI INIZIALIZZAZIONE //
// QUESTO SCRIPT VIENE INCLUSO E CHIAMATO OGNI VOLTA CHE SI CARICA UNA NUOVA PAGINA (solo 1 volta all'avvio del programma in questo caso) //
//////////////////////////////////////////////


/*dragDrop('#container', function (files, pos, fileList, directories) {
  openDragFile(files, fileList);
})*/

//Eventi drag and drop files (se file apri, se cartella mettila nel menù laterale)
var multi_selection = false;
var selected_array = [];
var selected_array_remote = [];
document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', function (e) {
  e.preventDefault();
  if (e.dataTransfer.files.length > 1) { console.log("troppi docs") }
  else {
    for (let f of e.dataTransfer.files) {
      console.log('File(s) you dragged here: ', f.path)
      openDragFile(f.path);
    }


  }
});

document.addEventListener('keydown', function(e){
  console.log(e);
   if(e.ctrlKey || event.metaKey){
   multi_selection = true;
    console.log("true!");
 }
})
document.addEventListener('keyup', function(e){
  console.log(e);
   if(e.ctrlKey || event.metaKey == false){
   multi_selection = false;
   console.log("false!");
 }
})

var ProgressBar = require('progressbar.js')
var line = new ProgressBar.Line('#container');

var watcher = "";
var currentProject = "";

// TEST FTP //

var Client = require('ftp');
var c = new Client();




function connect() {

  // connect to localhost:21 as anonymous
  c.connect({
    /*host: "",
    port: "",
    user: "",
    password: ""*/
    host: "",
    port: "",
    user: "",
    password: ""


  });

  c.on('ready', function () {
  var previously_open = document.getElementById('remote_directory').innerHTML;
  if(previously_open != "") {
   
    return;
  }


  c.list("", function (err, fileStream) {
    if (err) throw err;

    db.projects.find({ _id: currentProject }, function (err, docs) {
      var host = docs.map(function (element) {
        return element.address;
      })
      console.log(host);
      console.log(docs);
      console.dir(fileStream);

      var foldername = host;
      var folder = "<li id='" + host + "' class='directoryitem' ><div class='firstcol' onClick='expandDir_remote(this.parentNode);'>&#9660;</div> <img src='images/open.svg' class='secondcol'></img><div  class='thirdcol' style='white-space: nowrap;'>" + foldername + "</div></li>"

      var html = fileStream.map(file => {
        dirpath = file.name;
        var isdir = false;
        if (file.type == "d") { isdir = true }
        if (file.type == "-") { isdir = false }
        var to_be_inserted = [{ fileName: file.name, absolute_path: dirpath, is_dir: isdir, parent: foldername, is_open: false }];
        return to_be_inserted;
      })
      var main_folder = [{ fileName: foldername, absolute_path: foldername, is_dir: true, parent: undefined, is_open: true }];
      db.tree_remote.insert(html);

      db.tree_remote.find({}, function (err, docs) {
        console.log(docs);

        document.getElementById('remote_directory').innerHTML = "<ul id='rightclick_remote' class='ulelement'>" + folder + "<div id='M" + foldername + "'></div></div>";


        db.tree_remote.insert(main_folder);
        addRightClick_remote();
        createBranch(docs, foldername, true);
      });

    })



    //c.rename("/www.eliachiarucci.it/contatti.html", "/www.eliachiarucci.it/contatti.html", function(err, fileStream) {console.log(fileStream,err) })
    //c.end();
  })
})

}


function readfromconnection() {
  fs.readdir(fileNames[0], (err, files) => {
  })
}

db.projects.find({}, function (err, docs) {
  console.log(err, docs);
  var html = docs.map(function (element) {
    return '<option style="color: #999;" value="' + element.name + '">' + element.name + '</option>';
  }).join('');
  document.getElementById('select_project').innerHTML = '<select id="select" style="margin-top: 7px;">' + html + '</select>';

});
const { remote } = require('electron')
const { Menu, MenuItem } = remote
var totalpath = "";
var totalpath_remote = "";
const menu = new Menu()
menu.append(new MenuItem({ label: 'New file             ', click() { newProjectFile(totalpath) } }))
menu.append(new MenuItem({ label: 'New folder           ', click() { newProjectFolder() } }))
menu.append(new MenuItem({ label: 'Rename', click() { console.log('item 1 clicked') } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Upload', click() { console.log('item 1 clicked') } }))
menu.append(new MenuItem({ label: 'Download', click() { console.log('item 1 clicked') } }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Open in Finder             ', click() { open_in_finder(totalpath) } }))
menu.append(new MenuItem({ label: 'Delete', click() { console.log('item 1 clicked') } }))

const menu_remote = new Menu()
menu_remote.append(new MenuItem({ label: 'New file             ', click() { newProjectFile(totalpath) } }))
menu_remote.append(new MenuItem({ label: 'New folder           ', click() { newProjectFolder() } }))
menu_remote.append(new MenuItem({ label: 'Rename', click() { console.log('item 1 clicked') } }))
menu_remote.append(new MenuItem({ type: 'separator' }))
menu_remote.append(new MenuItem({ label: 'Upload', click() { console.log('item 1 clicked') } }))
menu_remote.append(new MenuItem({ label: 'Download', click() { downloadFile_remote() } }))
menu_remote.append(new MenuItem({ type: 'separator' }))
//menu_remote.append(new MenuItem({ label: 'Open in Finder             ', click() { open_in_finder(totalpath) } }))
menu_remote.append(new MenuItem({ label: 'Delete', click() { console.log('item 1 clicked') } }))


/*function downloadFile_remote(value, _callback) {
  if (selected_array_remote.length >= 1){
    selected_array_remote.forEach(function(element){
     console.log(element)
    })}
}*/

function downloadFile_remote(index, _callback) {
  console.log(index);

   c.removeAllListeners();
    if (index == undefined) {
      index = 0;
    }
    var going = false;
    if (index == selected_array_remote.length) {
      
      return;

    }
    var value = selected_array_remote[index];
    console.log(value);
    console.log(selected_array_remote);
      var search = path.dirname(value);
 
  if(search == value) {search = ""};
  var file = "";
  c.list(search, function(err,list){
    console.log(list);
    file = list.filter(function(element){
        return element.name == path.basename(value);
    })
    console.log(file);
    console.log(file[0].type)
    if(file[0].type == "-"){

      c.get(value, function(err, stream) {
      if (err) throw err;
      stream.once('close', function() { /*c.end();*/ });
      db.projects.find({_id: currentProject}, function(err,docs){
        var main_local_dir = docs.map(function(element){
          return element.path;
        })
        console.log(main_local_dir);
        var total_remote_path = main_local_dir+path.sep+value;
        var dirname = path.dirname(total_remote_path);

        if(!fs.existsSync(dirname)){
        
        fs.mkdir(dirname, {recursive: true}, function (err) {
          stream.pipe(fs.createWriteStream(main_local_dir+path.sep+value));
          stream.on('end', function () { {downloadFile_remote(index+1, _callback)} });
        if (err) {
        throw err;
        reject();
        }
       })
         
       } else if (!fs.lstatSync(dirname).isDirectory()){
                 fs.mkdir(dirname, function (err) {
                  stream.pipe(fs.createWriteStream(main_local_dir+path.sep+value));
                 stream.on('end', function () { {downloadFile_remote(index+1,  _callback)} });
        if (err) {
        throw err;
        reject();
        }
       })
        } else {
          stream.pipe(fs.createWriteStream(main_local_dir+path.sep+value));
         stream.on('end', function () { { downloadFile_remote(index+1,  _callback)} });
        }


                  
       })
    })
      
      
  } else if(file[0].type == "d") {
    console.log(file[0])
    var start_path = search;

      var test22 = [file[0].name];
      var going = true;
      getRecursively(c,file[0].name).then(function(value){
        console.log(value);
        downloadRecursively(value, 0, function(value){
          console.log("FINISH E FUNZIONA", value);
          downloadFile_remote(index+1);
        });
      });
      
      //test_start(test22);
      /*recursive_remote([file[0].name], [], function(element){
        console.log(element)

      });*/
  

      //recursive_path_array.append(recursive_remote(file[0].name));
     list.forEach(function (element){
        console.log(element);
      })
  }



})

}



process.setMaxListeners(0);

function downloadRecursively(value, i, _callback) {
    var _this = this;
    var last = false;
    
    
    let promise1 = new Promise((resolve, reject) => {
 if (i >= value.length) {last=true;}
    console.log(value);
    if(last == false){
    value1 = value[i].path + "/" + value[i].name;
    console.log(value1);
      c.get(value1, function(err, stream) {
      if (err) throw err;
      db.projects.find({_id: currentProject}, function(err,docs){
        var main_local_dir = docs.map(function(element){
          return element.path;
        })
        console.log(main_local_dir);
        var total_remote_path = main_local_dir+path.sep+value1;
        var dirname = path.dirname(total_remote_path);

        if(!fs.existsSync(dirname)){
        
        fs.mkdir(dirname,{ recursive: true }, function (err) {
        if (err) {
        throw err;
        }

                  console.log(stream.pipe(fs.createWriteStream(main_local_dir+path.sep+value1)));
                  stream.on('end', function () { _this.downloadRecursively(value, i=i+1, _callback)});
       })
         
       } else  if (!fs.lstatSync(dirname).isDirectory()){
    
       
        fs.mkdir(dirname,{ recursive: true }, function (err) {

        if (err) {
        throw err;
        }

                  console.log(stream.pipe(fs.createWriteStream(main_local_dir+path.sep+value1)));
                  stream.on('end', function () { _this.downloadRecursively(value, i=i+1, _callback) });
       
        })} else {

                  console.log(stream.pipe(fs.createWriteStream(main_local_dir+path.sep+value1)));
                  stream.on('end', () => { _this.downloadRecursively(value, i=i+1, _callback)});
        }


       })
    })
               

        c.on('error', (err) => {
            if (err) console.log(err);
            _this.onCompleteCallback();
        })
      } else if(last == true) {

        console.log("last"); 
        _callback();

      }
    })
    return promise1;
}


function getRecursively(client, path) {
    var _this = this;
    var downloadList = [];
    let paths = [];

    let promise = new Promise((resolve, reject) => {

        client.list(path, function(err, list) {
          console.log(list)

            async function loop() {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].type == 'd') {
                        let _list = await _this.getRecursively(client, path + '/' + list[i].name)
                        downloadList = downloadList.concat(_list);
                    } else {
                        
                            downloadList.push({path: path, name: list[i].name});
                        
                    }
                }
           resolve(downloadList);
                
            }

            loop();
        })



                
    })
    console.log(downloadList);
    return promise;

}


/*function haha(array){
  recursive_download(array);
}*/

function recursive_download(array, files) {
    if(array.length == 0){
    console.log("yes");
    return;
  } else {
  var array1 = [];
  array1.push(array);
  var files1 = [];
  files1.push(files);
  array.forEach(function(element){
    console.log(element);
    listing(element);
  })
  console.log(array.length);

  return files;
}}

function listing(element) {
  console.log(element);
  var folder = element;
    c.list(element, function(err, files){
      console.log(files);
      var f = files.filter(function (element){
        return element.type == "d";
      })
      var files = files.filter(function(element){
        return element.type == "-";
      })
      f.forEach(function (element){
        recursive_download([folder+"/"+element.name],[files]);
      })
      if (f.length == 0){
        recursive_download([]);
      }
    })
}

/*function test_start(test22){
  console.log(test22);
       var test33 = test22.forEach(function(element){
        console.log(element)
        return test_func(element, test_func);
      })
       console.log(test33);
       return test_start(test33);
}

function test_func(value, callback) {
      var temp_array = [];
      var to_scan = [];
        c.list(value, function(err,files){
        console.log(files);
        var dir_files = files.filter(function(element){
          return element.type == "d";
        })
        var files = files.filter(function(element){
          return element.type == "-";
        })
        files.forEach(function(element){
          temp_array.push(value+"/"+element.name);
        })
        dir_files.forEach(function(element){
          to_scan.push(value+"/"+element.name);
        })
        console.log(temp_array);
        callback(dir_files);
       // return dir_files;
       // var to_return = {to_download: temp_array, to_scan: dir_files};
        //console.log(to_return)
        
     })

      }*/


/*function recursive_remote(value,array,_callback){
  console.log(value)
  if (value < 5){
  return recursive_remote(value+1,[], function(){});
  }
  else {_callback(value)};
}*/

function recursive_remote(value,array){

  var temp_array = array;
  console.log(value)
    if(value.length == 0) {
      
      return;}
  console.log(temp_array)
  console.log(value)
  var to_scan = [];
var promise1 = new Promise(function(resolve, reject) {
      value.forEach(function(element){
        c.list(element, function(err,files){
        console.log(files);
        var dir_files = files.filter(function(element){
          return element.type == "d";
        })
        var files = files.filter(function(element){
          return element.type == "-";
        })
        files.forEach(function(element){
          temp_array.push(value+"/"+element.name);
        })
        dir_files.forEach(function(element){
          to_scan.push(value+"/"+element.name);
        })
        console.log(temp_array);
       // var to_return = {to_download: temp_array, to_scan: dir_files};
        //console.log(to_return)
        
     })

      })
      resolve();
});
     promise1.then(function(value) {
console.log(to_scan);
          return recursive_remote(to_scan,temp_array);
});
        

        //_callback(temp_array);
    }





function open_in_finder(value) {
  shell.showItemInFolder(value)

}

function newProjectFile(value) {
  var currentpath = value + path.sep + "New File";
  console.log(currentpath);
  if (fs.lstatSync(value).isDirectory()) {
    fs.writeFile(currentpath, "", (err) => {
      if (err) throw err;

      console.log("The file was succesfully saved!");
    });
  } else {
    var parent_dir = path.dirname(value);
    currentpath = parent_dir + path.sep + "New File";
    fs.writeFile(currentpath, "", (err) => {
      if (err) throw err;

      console.log("The file was succesfully saved!");
    });
  }

}

function local_folder(_this) {
  document.getElementById('directory').style.display = "block";
  document.getElementById('remote_directory').style.display = "none";
  $(".mode_active").removeClass("mode_active");
  $(_this).addClass("mode_active");

}

function remote_folder(_this) {
  document.getElementById('directory').style.display = "none";
  document.getElementById('remote_directory').style.display = "block";
  $(".mode_active").removeClass("mode_active");
  $(_this).addClass("mode_active");
}

function addRightClick() {
  document.getElementById("rightclick").addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation();
    var targetElement = event.target || event.srcElement;

    try { targetElement.children[2].innerHTML }
    catch (err) {
      targetElement = targetElement.parentNode;
    }
    console.log(targetElement);
    var rclickpath = targetElement.id;

    if(selected_array.length == 1){
    select_active(targetElement);
    }
    var rclickname = targetElement.children[2].innerHTML;
    totalpath = (rclickpath);
    console.log(totalpath);
    menu.popup({ window: remote.getCurrentWindow() })
  }, false)
}

function addRightClick_remote() {
    document.getElementById("rightclick_remote").addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation();
    var targetElement = event.target || event.srcElement;

    try { targetElement.children[2].innerHTML }
    catch (err) {
      targetElement = targetElement.parentNode;
    }
    console.log(targetElement);
    var rclickpath = targetElement.id;
    
    console.log(selected_array_remote.length);
    if(selected_array_remote.length == 1) {
      selected_array_remote.push(rclickpath);
      select_active_remote(targetElement);
    }
    
    var rclickname = targetElement.children[2].innerHTML;
    //totalpath_remote = (rclickpath);
    console.log(totalpath);
    menu_remote.popup({ window: remote.getCurrentWindow() })
  }, false)
}

function loadproject(value) {
  console.log(value, currentProject);
  if (value != currentProject) {
      currentProject = value;
      document.getElementById('remote_directory').innerHTML = "";
   db.tree_remote.remove({}, {multi:true}, function(err,removed){
  db.projects.find({ _id: value }, function (err, docs) {
    console.log(docs[0].path)
    openDragFile(docs[0].path);
    connect();
    })
    })
  
  
} else {return;}

}
///////////////////////////////////////////////////
// FINE VARIABILI E FUNZIONI DI INIZIALIZZAZIONE //
///////////////////////////////////////////////////
/*$( "#dialog" ).dialog({
 dialogClass: "no-close",
  resizable: false,
  title: "Project",
  classes: {
    "ui-dialog-buttonset" : "ui-button-custom",
  },
  buttons: [
    {
      text: "Save",
      click: function() {
        $( this ).dialog( "close" );
      }
    }
  ]
});*/

function projectwindow() {
  ipcRenderer.send('project');
}

ipcRenderer.on('new_project', function (event) {
  makeProjectList();
})













////////////////////////////////
// FUNZIONI PER L'INTERFACCIA //
////////////////////////////////


$.get("homepage.html", function (data) {
  console.log(data);
  loadthtml(data);
  starterhtml = data;

});


initialize();
ipcRenderer.on('savefile', (event) => {
  saveFile();
});

function initialize() {

  const path = require('path');
  const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');
  const amdRequire = amdLoader.require;
  const amdDefine = amdLoader.require.define;
  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
      pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
  }
  amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, '../node_modules/monaco-editor/min'))
  });
  // workaround monaco-css not understanding the environment
  self.module = undefined;
  amdRequire(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('container'), {
      model: null,
      /*value: [
      data
      ].join('/n'),*/
      theme: "vs-dark",
      quickSuggestions: true,
      fontSize: 12,
      fontWeight: "bold",
      extraEditorClassName: 'customeditor',
    });
  });
}

function loadthtml(data) {

  $('#container').append(data);
}

function starthtml() {
  console.log(starthtml)
  $('#container').append(starterhtml);
}

function deleteFrontPage() {
  $('#front').remove();
}

console.log(typeof editor);
console.log(editor);
var scrwidth = 0;
scrwidth = $('#tab')[0].scrollWidth;
$("#container").resizable();
$('#container').resize(function () {
  scrwidth = $('#tab')[0].scrollWidth;
  $('#rightmenu').width($(window).width() - $("#container").width());

  $('#tabcontainer').width($('#container').width());
  if (editor != "") {
    editor.layout();
  }
  if (('#rightmenu').width + $("#container").width() != $(window).width) {
    $('#rightmenu').width($(window).width() - $("#container").width());
  }
});
$(window).resize(function () {
  scrwidth = $('#tab')[0].scrollWidth;
  $('#container').width($(window).width() - $("#rightmenu").width());
  $('#tabcontainer').width($('#container').width());
  if (editor != "") {
    editor.layout();
  }
  if (('#rightmenu').width + $("#container").width() != $(window).width) {
    $('#container').width($(window).width() - $("#rightmenu").width());
  }
});



$('#tab').sortable({

  // axis: x or y

  axis: 'x',

  // container

  containment: 'parent',

  // animation speed

  animation: 150,

  placeholder: 'sortable-placeholder',
  start: function (event, ui) {
    width1 = $(ui.item[0].width);
    width = ui.item[0].offsetWidth;
    $(ui.placeholder).css({ "min-width": width });
  }
}
)



$(document).on('click', '.draggable', function () {
  $('.draggable').each(function () {
    $(this).removeClass("active");
  })
  $(this).addClass("active");
  console.log(this.id)
  changeTab(this.id);

});

/*$(document).on('click','.closebtn',function(){
 event.stopPropagation(); 
 closeTab(this);
event.stopImmediatePropagation()
event.preventDefault()
  console.log( "CLOSING" );

});*/
$(document).on('mouseenter', '.closebtn', function () {
  $(this).parent().parent().sortable("disable");
});
$(document).on('mouseleave', '.closebtn', function () {
  $(this).parent().parent().sortable("enable");
});



$('#leftarrow').on({
  'mousedown touchstart': function () {
    currentpos = $('#tab').scrollLeft();
    scrwidth = $('#tab')[0].scrollWidth;
    scrollnormalized = scrwidth - tabwidth;
    console.log(scrollnormalized);
    scrmap = map(currentpos, 0, scrollnormalized, 1, 2000)//map(scrollnormalized,0,scrwidth,2,0.5);
    $("#tab").animate({
      scrollLeft: 0
    }, scrmap, "linear");
  },
  'mouseup touchend': function () {
    $("#tab").stop(true);
  }
});

function map(x, in_min, in_max, out_min, out_max) {
  var a = ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
  return a;
}

$('#rightarrow').on({
  'mousedown touchstart': function () {
    currentpos = $('#tab').scrollLeft();
    tabwidth = $('#tab').width();
    scrollnormalized = $("#tab")[0].scrollWidth - tabwidth;
    console.log(scrollnormalized);
    scrmap = map(currentpos, 0, scrollnormalized, 2000, 1);
    $("#tab").animate({
      scrollLeft: scrollnormalized
    }, scrmap, "linear");
  },
  'mouseup touchend': function () {
    $("#tab").stop(true);
  }
});


/////////////////////////////////////
// FINE FUNZIONI PER L'INTERFACCIA //
/////////////////////////////////////






////////////////////////////////////////
// CODICI PER LA GESTIONE DELL'EDITOR //
////////////////////////////////////////


var asd = "";

function newModel(data, name) {
  var language = name.split('.').pop()
  console.log(language);
  if (language == "js") {
    language = "javascript";
  }
  deleteFrontPage();
  editor.setModel(monaco.editor.createModel(data, language));
  console.log(editor.getModel());

  return asd;
}

var currentstate = {};
function changeTab(id) {
  var savemodel = editor.getModel().id;
  currentstate[savemodel] = editor.saveViewState();
  var changemodel = monaco.editor.getModels().filter(function (models) { return models.id == id });
  console.log(currentstate);
  editor.setModel(changemodel[0]);
  console.log(changemodel[0].id)
  editor.restoreViewState(currentstate[changemodel[0].id]);
  editor.focus();
  editor.getModel().onDidChangeContent((event) => {
    console.log(editor.getModel().id);
  });
}

function closeTab(element) {
  event.stopPropagation();
  var ebefore = $(element).parent().prev();
  console.log(ebefore);
  if (ebefore[0] == undefined) {
    ebefore = $(element).parent().next();
    console.log(ebefore[0]);
  }
  if (ebefore[0] == undefined) {
    monaco.editor.getModels()[0].dispose();
    $(element).parent().remove();
    starthtml();
    return;
  }
  console.log(ebefore[0]);
  var ebeforeid = ebefore[0].id;
  var changemodel = monaco.editor.getModels().filter(function (models) { return models.id == ebeforeid });



  var id = element.id;
  var deletemodel = monaco.editor.getModels();
  var a = undefined;
  deletemodel.forEach(function (models, i) {
    if (models.id == id)
      a = i;
  })
  console.log(editor.getModel());
  console.log(monaco.editor.getModels()[a]);
  if (editor.getModel() != monaco.editor.getModels()[a]) {

  } else { editor.setModel(changemodel[0]); makeactive(ebeforeid); }

  monaco.editor.getModels()[a].dispose();
  $(element).parent().remove();

}


function makeactive(id) {
  $('.draggable').each(function () {
    $(this).removeClass("active");
  })
  document.getElementById(id).classList.add("active");

}


/////////////////////////////////////////////
// FINE CODICI PER LA GESTIONE DELL'EDITOR //
/////////////////////////////////////////////







/////////////////////////////////////
// CODICI PER LA GESTIONE DEI FILE //
/////////////////////////////////////


var currentPath = "";

function openDirectory() {
  if (watcher != "") { watcher.close(); }
  dialog.showOpenDialog({
    filters: [

      {

        name: 'text',
        extensions: ['js', 'html', 'css', 'php']
      }

    ],
    properties: ['openDirectory'],
  }, function (fileNames) {
    if (fileNames === undefined) return;
    console.log(fileNames[0])
    //var tree = dirTree(fileNames[0]);
    //console.log(tree);

    fs.readdir(fileNames[0], (err, files) => {
      /*   var test12 = "ciao\mi chiamo\eee";
         console.log(test12.split(/[\/]/)); */

      var watcher = chokidar.watch(fileNames[0], {
        ignored: /(^|[\/\\])\../,

      });




      var foldername = path.normalize(fileNames[0].split(path.sep).pop());
      console.log(foldername);
      var folder = "<li class='directoryitem' id='1'><div class='firstcol' onClick='expandMainContainer(this);'>&#9660;</div> <img src='images/open.svg' class='secondcol'></img><div contenteditable='true' id='" + fileNames[0] + "' class='thirdcol' style='white-space: nowrap;'>" + foldername + "</div></li>"
      currentPath = fileNames[0];
      var html = files.map(file => {
        dirpath = path.normalize(fileNames[0] + "/" + file);
        var isdir = fs.lstatSync(dirpath).isDirectory();
        console.log(isdir);
        if (isdir == true) {
          return "<li class='directoryitem' style='padding-left:20px;'><div class='firstcol' onClick='expandDir(this);'>&#9654;</div> <img src='images/closed.svg'  class='secondcol'></img><div contenteditable='true' id='" + fileNames[0] + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
        if (isdir == false) {
          return "<li class='directoryitem' style='padding-left:20px;' ondbClick='openMenuFile(this)'><div class='firstcol'> </div> <img src='images/foglio.svg'  class='secondcol'></img><div contenteditable='true' id='" + fileNames[0] + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
      }).join("");
      console.log(folder);
      document.getElementById('directory').innerHTML = "<ul id='rightclick' class='ulelement'>" + folder + "<div id='maincontainer'>" + html + "</div></ul>";
      addRightClick();
    })

  })
};

window.addEventListener("dblclick", (e) => { console.log("YOU CLICKED") })
function refreshdir(fileNames) {
  console.log(fileNames)
  fs.readdir(fileNames, (err, files) => {
    var foldername = path.normalize(fileNames.split(/[\/]/).pop());
    console.log(foldername);
    var folder = "<li class='directoryitem' id='1'><div class='firstcol' onClick='expandMainContainer(this);'>&#9660;</div> <img src='images/open.svg' class='secondcol'></img><div id='" + fileNames + "' class='thirdcol' style='white-space: nowrap;'>" + foldername + "</div></li>"
    var html = files.map(file => {
      dirpath = path.normalize(fileNames + "/" + file);
      var isdir = fs.lstatSync(dirpath).isDirectory();
      console.log(isdir);
      if (isdir == true) {
        return "<li class='directoryitem' style='padding-left:20px;'><div class='firstcol' onClick='expandDir(this);'>&#9654;</div> <img src='images/closed.svg'  class='secondcol'></img><div id='" + fileNames + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
      }
      if (isdir == false) {
        return "<li class='directoryitem' style='padding-left:20px;' onClick='openMenuFile(this)'><div class='firstcol'> </div> <img src='images/foglio.svg'  class='secondcol'></img><div id='" + fileNames + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
      }
    }).join("");
    db.projects.update({ path: fileNames }, { $set: { date: new Date() } }, function (err, numReplaced) {
      console.log(numReplaced)
    })
    console.log(folder);
    document.getElementById('directory').innerHTML = "<ul id='rightclick' class='ulelement'>" + folder + "<div id='maincontainer'>" + html + "</div></ul>";
    addRightClick();
  })
}


function expandMainContainer(value) {
  var div = value.parentNode;
  var container = document.getElementById('maincontainer');
  if (div.id == 1) {
    container.style.visibility = "hidden";
    div.id = 0;
    value.innerHTML = "&#9654;"
    let parent = value.parentNode;
    parent.children[1].src = "images/closed.svg"
  } else {
    div.id = 1;
    container.style.visibility = "visible";
    value.innerHTML = "&#9660;"
    let parent = value.parentNode;
    parent.children[1].src = "images/open.svg"

  }

}



function refreshdir2(path1) {
  console.log(path1);
  var main_dir = document.getElementById(path1).parentNode.parentNode.previousElementSibling;
  if (main_dir.id == 1) {
    var marginLeft = (parseInt($(main_dir).css("marginLeft"))) + 20;
    fs.readdir(path1, (err, files) => {
      var html = files.map(file => {
        dirpath = path.normalize(path1 + "/" + file);
        var isdir = fs.lstatSync(dirpath).isDirectory();
        console.log(isdir);

        if (isdir == true) {
          return "<li class='directoryitem' style='padding-left:" + marginLeft + "px;'><div class='firstcol' onClick='expandDir(this);'>&#9654;</div> <img src='images/closed.svg'  class='secondcol'></img><div  id='" + path1 + "'  class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
        if (isdir == false) {
          return "<li class='directoryitem'  style='padding-left:" + marginLeft + "px;'ondbClick='openMenuFile(this)'><div class='firstcol'> </div> <img src='images/foglio.svg'  class='secondcol'></img><div id='" + path1 + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
      }).join("");
      console.log(html);
      path1 = path1.split(" ").join("()*()*()")
      var toRemove = document.getElementById(path1.split(" ").join("()*()*()"));
      console.log(toRemove);
      main_dir.parentNode.removeChild(toRemove);
      $(main_dir).after("<div id=" + path1 + ">" + html + "</div>");
    })
  }
}

function tree_refresh(path1) {
  db.tree.find({ absolute_path: path1 }, function (err, docs) {
    console.log(path1);
    var dir_to_refresh = docs.map(function (element) {
      return element.parent;
    }).join("")
    console.log(dir_to_refresh);
    db.tree.find({ parent: dir_to_refresh }, function (err, docs) {
      createBranch(docs, dir_to_refresh);
    })

  })
}

function tree_unlink(path1) {
  db.tree.find({ absolute_path: path1 }, function (err, docs) {
    var parent_dir = docs.map(function (element) {
      return element.parent;
    }).join("");
    db.tree.remove({ absolute_path: path1 }, function (err, numRemoved) {
      db.tree.find({ parent: parent_dir }, function (err, docs) {
        createBranch(docs, parent_dir);
      })
    })
  })
}

function tree_unlinkDir(path1) {
  db.tree.find({ absolute_path: path1 }, function (err, docs) {
    var parent_dir = docs.map(function (element) {
      return element.parent;
    }).join("");
    db.tree.remove({ absolute_path: path1 }, function (err, numRemoved) {
      db.tree.remove({ parent: { $gte: path1 } }, { multi: true }, function (err, docsremoved) {
        db.tree.find({ parent: parent_dir }, function (err, docs) {
          createBranch(docs, parent_dir);
        })
      })
    })
  })
}

function tree_addDir(path1) {
  db.tree.insert([{ fileName: path.basename(path1), absolute_path: path1, is_dir: true, parent: path.dirname(path1), is_open: false }])
  db.tree.find({ absolute_path: path1 }, function (err, docs) {
    var parent_dir = docs.map(function (element) {
      return element.parent;
    }).join("");
    db.tree.find({ parent: parent_dir }, function (err, docs) {
      createBranch(docs, parent_dir);
    })

  })
}

function tree_change() { }

function tree_add(path1) {
  db.tree.insert([{ fileName: path.basename(path1), absolute_path: path1, is_dir: false, parent: path.dirname(path1), is_open: false }])
  db.tree.find({ absolute_path: path1 }, function (err, docs) {
    var parent_dir = docs.map(function (element) {
      return element.parent;
    }).join("");
    db.tree.find({ parent: parent_dir }, function (err, docs) {
      createBranch(docs, parent_dir);
    })

  })

}

function createBranch(docs, id, is_remote) {
  var function_mode = "expandDir";
  var rightclick_mode = "rightclick";
  var openMenuFile = "openMenuFile";
  var select_active_mode = "select_active";
  if (is_remote) { function_mode = "expandDir_remote", rightclick_mode = "rightclick_remote", openMenuFile = "openMenuFile_remote", select_active_mode = "select_active_remote" };
  console.log(id);
  try {
  var padding_left = parseInt(document.getElementById(id).style.paddingLeft) || 0;
  } catch {return;}
  console.log(padding_left);
  var html = docs.map(function (element) {
    if (element.is_dir == true) {
      return "<li id='" + element.absolute_path + "' class='directoryitem' style='padding-left:"+(padding_left+20)+"px;' onclick='"+select_active_mode+"(this)' ><div class='firstcol' onClick='" + function_mode + "(this.parentNode);'>&#9654;</div> <img src='images/closed.svg'  class='secondcol'></img><div class='thirdcol' style='white-space: nowrap;'>" + element.fileName + "</div></li><div class='padded_folder' id='M" + element.absolute_path + "'></div>";
    }
    if (element.is_dir == false) {
      return "<li id='" + element.absolute_path + "' class='directoryitem' style='padding-left:"+(padding_left+20)+"px;' onclick='"+select_active_mode+"(this)' ondblClick='"+openMenuFile+"(this)'><div class='firstcol'> </div> <img src='images/foglio.svg'  class='secondcol'></img><div class='thirdcol' style='white-space: nowrap;'>" + element.fileName + "</div></li>";
    }
  }).join("");


  console.log(id);
  console.log(docs);
  document.getElementById("M" + id).innerHTML = "<ul id='"+rightclick_mode+"' class='ulelement'>  " + html + "</ul>";

}

function select_active(_this) {
  if(multi_selection == false) {
  $('.directoryitem').css("background-color", "transparent");
  selected_array = [];
  selected_array.push(_this.id);
  _this.style.backgroundColor = "rgba(0,153,255,0.3)"; }
  else if (multi_selection == true) {
  _this.style.backgroundColor = "rgba(0,153,255,0.3)";
  selected_array.push(_this.id);
  }
}

function select_active_remote(_this) {
  if(multi_selection == false) {
  $('.directoryitem').css("background-color", "transparent");
  selected_array_remote = [];
  selected_array_remote.push(_this.id);
  _this.style.backgroundColor = "rgba(0,153,255,0.3)"; }
  else if (multi_selection == true) {
  _this.style.backgroundColor = "rgba(0,153,255,0.3)";
  selected_array_remote.push(_this.id);
  }
}

function openDragFile(fileNames) {
  db.tree.remove({}, { multi: true }, function (err, numRemoved) {
  
  });
    db.tree_remote.remove({}, { multi: true }, function (err, numRemoved) {
    console.log(numRemoved)
  });
  if (watcher != "") { watcher.close(); }
  console.log(watcher);
  if (fileNames === undefined) return;
  console.log(fileNames)
  var isdir = fs.lstatSync(fileNames).isDirectory();
  console.log(isdir);
  if (isdir == true) {

    fs.readdir(fileNames, (err, files) => {
      /*   var test12 = "ciao\mi chiamo\eee";
         console.log(test12.split(/[\/]/)); */
      console.log(fileNames);
      watcher = chokidar.watch(fileNames, {
        ignored: /(^|[\/\\])\../,
        ignoreInitial: true,
        depth: 0
      });

      watcher
        .on('change', path1 => tree_change(path1))
        .on('add', path1 => tree_add(path1))
        .on('unlink', path1 => tree_unlink(path1))
        .on('addDir', path1 => tree_addDir(path1))
        .on('unlinkDir', path1 => tree_unlinkDir(path1))


      var foldername = path.normalize(fileNames.split(path.sep).pop());
      console.log(foldername);
      var folder = "<li id='" + fileNames + "' class='directoryitem' ><div class='firstcol' onClick='expandDir(this.parentNode);'>&#9660;</div> <img src='images/open.svg' class='secondcol'></img><div  class='thirdcol' style='white-space: nowrap;'>" + foldername + "</div></li>"
      currentPath = fileNames;
dir_absolute = path.normalize(fileNames);
      var html = files.map(file => {
        dirpath = path.normalize(fileNames + "/" + file);
        
        var isdir = fs.lstatSync(dirpath).isDirectory();
        var to_be_inserted = [{ fileName: file, absolute_path: dirpath, is_dir: isdir, parent: dir_absolute, is_open: false }];
        return to_be_inserted;

        /*console.log(isdir);
        if (isdir == true) {
          return "<li class='directoryitem' style='margin-left:20px;'><div class='firstcol' onClick='expandDir(this);'>&#9654;</div> <img src='images/closed.svg'  class='secondcol'></img><div id='" + dirpath + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
        if (isdir == false) {
          return "<li class='directoryitem' style='margin-left:20px;' onClick='openMenuFile(this)'><div class='firstcol'> </div> <img src='images/foglio.svg'  class='secondcol'></img><div id='" + dirpath + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
      }).join("");
      console.log(folder);
      document.getElementById('directory').innerHTML = "<ul id='rightclick'  class='ulelement'>" + folder + "<div id='maincontainer'>" + html + "</div></ul>";
        addRightClick();*/
      })

      var main_folder = [{ fileName: foldername, absolute_path: dir_absolute, is_dir: true, parent: undefined, is_open: true }];
      db.tree.insert(html);

      db.tree.find({}, function (err, docs) {
        console.log(docs);
        document.getElementById('directory').innerHTML = "<ul id='rightclick' class='ulelement'>" + folder + "<div id='M" + dir_absolute + "'></div></div>";

        createBranch(docs, dir_absolute);
        db.tree.insert(main_folder);
        addRightClick();
      })
    })

  } else {
    fs.readFile(fileNames, 'utf-8', function (err, data) {
      // console.log(data);
      console.log(fileNames);
      var name = path.basename(fileNames);
      newModel(data, name);
      var id = editor.getModel().id;
      var draggables = '<div class="draggable" id="' + id + '"> <p id="' + fileNames + '" class="tabtext">' + name + '</p> <p class="closebtn" id="' + id + '"  onClick = "closeTab(this);"> × </p> </div>'

      $('#tab').append(draggables);
      makeactive(id);
      deleteFrontPage();
      $("#tab").sortable("refresh");
      editor.getModel().onDidChangeContent((event) => {
        console.log(editor.getModel().id);
        $(".active").children(".closebtn").html("•");

      });
    })
  }
}


function checkConnection() {
  console.log(c.connected);
  if (c.connected == false) {
    connect();
  }
}

function expandDir_remote(item) {
  var value = item.id;
  console.log(item);
  event.stopPropagation();
  checkConnection();
  var fileNames = value;
  db.tree_remote.find({ absolute_path: value }, function (err, docs) {

    if (docs[0].is_open == true) {
      item.children[1].src = "images/closed.svg";
      item.children[0].innerHTML = "&#9654;";
      document.getElementById("M" + value).innerHTML = "";
      console.log(value);
      //var regex = new RegExp('.*?'+value, 'i');
      db.tree_remote.remove({ parent: { $gte: value } }, { multi: true }, function (err, docsremoved) {
        console.log(docsremoved);
        console.log(docs);
        db.tree_remote.update({ absolute_path: value }, { $set: { is_open: false } }, {}, function (err, changed) {
          console.log(changed);
        })

      })
    }
    else {
      if (docs[0].is_open == false) {
        item.children[1].src = "images/open.svg";
        item.children[0].innerHTML = "&#9660;";
        db.tree_remote.update({ absolute_path: value }, { $set: { is_open: true } }, {}, function (err, changed) {
          console.log(changed);

          db.projects.find({ _id: currentProject }, function (err, docs) {
            var host = docs.map(function (element) {
              return element.address;
            })
            var separator = "/";
            if (value == host) { value = "", separator = "" };
            console.log(value, host)
            c.list(value, function (err, files) {
              var html = files.map(function (file) {
                dirpath = value + separator + file.name;
                var isdir = false;
                if (file.type == "d") { isdir = true }
                if (file.type == "-") { isdir = false }
                var to_be_inserted = [{ fileName: file.name, absolute_path: dirpath, is_dir: isdir, parent: value, is_open: false }];
                console.log(dirpath);
                return to_be_inserted;
              })
              db.tree_remote.insert(html);
              db.tree_remote.find({ parent: value }, function (err, docs) {
                console.log(docs);

                if (value == "") { value = host };
                createBranch(docs, value, true);

              })


            })
          })
        })



        //c.end();


      }
    }
  })
}


function expandDir(item) {
  var value = item.id;
  console.log(item);
  event.stopPropagation();

  var fileNames = value;
  db.tree.find({ absolute_path: value }, function (err, docs) {

    if (docs[0].is_open == true) {
      item.children[1].src = "images/closed.svg";
      item.children[0].innerHTML = "&#9654;";
      watcher.unwatch(fileNames);
      document.getElementById("M" + value).innerHTML = "";
      console.log(value);
      //var regex = new RegExp('.*?'+value, 'i');
      db.tree.remove({ parent: { $gte: value } }, { multi: true }, function (err, docsremoved) {
        console.log(docsremoved);
        console.log(docs);
        db.tree.update({ absolute_path: value }, { $set: { is_open: false } }, {}, function (err, changed) {
          console.log(changed);
        })

      })
    }
    else {
      if (docs[0].is_open == false) {
        watcher.add(fileNames);
        item.children[1].src = "images/open.svg";
        item.children[0].innerHTML = "&#9660;";
        db.tree.update({ absolute_path: value }, { $set: { is_open: true } }, {}, function (err, changed) {
          console.log(changed);
        })
        fs.readdir(value, (err, files) => {
          var html = files.map(function (file) {
            dirpath = path.normalize(fileNames + "/" + file);
            dir_absolute = path.normalize(fileNames);
            var isdir = fs.lstatSync(dirpath).isDirectory();
            var to_be_inserted = [{ fileName: file, absolute_path: dirpath, is_dir: isdir, parent: dir_absolute, is_open: false }];
            return to_be_inserted;
          })
          db.tree.insert(html);
          db.tree.find({ parent: value }, function (err, docs) {
            console.log(docs);
            createBranch(docs, value);

          })
        })

      }
    }
  })




  /*if (value.id == 1) {
    value.id = 0;
    var toRemove = document.getElementById(pathname.split(" ").join("()*()*()"));
    console.log(value);
    console.log(toRemove);
    value.parentNode.removeChild(toRemove);
    value.children[1].src = "images/closed.svg";
    value.children[0].innerHTML = "&#9654;";
   console.log(watcher.unwatch(fileName));
  } else {
    value.id = 1;
    console.log(watcher.add(fileName));
    value.children[1].src = "images/open.svg";
    value.children[0].innerHTML = "&#9660;";

    var marginLeft = (parseInt($(value).css("marginLeft"))) + 20;
    console.log(parseInt($(value).css("marginLeft")));
    console.log(fileName)
    console.log(pathname);
    fs.readdir(fileName, (err, files) => {
      var html = files.map(file => {
        dirpath = path.normalize(pathname + "/" + file);
        var isdir = fs.lstatSync(dirpath).isDirectory();
        console.log(isdir);

        if (isdir == true) {
          return "<li class='directoryitem' style='margin-left:" + marginLeft + "px;'><div class='firstcol' onClick='expandDir(this);'>&#9654;</div> <img src='images/closed.svg'  class='secondcol'></img><div  id='" + dirpath + "'  class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
        if (isdir == false) {
          return "<li class='directoryitem'  style='margin-left:" + marginLeft + "px;'onClick='openMenuFile(this)'><div class='firstcol'> </div> <img src='images/foglio.svg'  class='secondcol'></img><div id='" + dirpath + "' class='thirdcol' style='white-space: nowrap;'>" + file + "</div></li>";
        }
      }).join("");
      console.log(html);
      pathname = pathname.split(" ").join("()*()*()")
      $(value).after("<div id=" + pathname + ">" + html + "</div>");
    })
  }*/
}

function openMenuFile(value) {
  var name = $(value).children(".thirdcol").text();
  var check = $('.draggable');
  var already_open = false;
  console.log(value.id);
  
  for (i = 0; i < check.length; i++) {
    if (value.id == check[i].children[0].id) {
      console.log(check[0]);
      makeactive(check[i].id);
      already_open = true;
    }
  }

  if (already_open == false) {
    var path1 = value.id;
    var pathname = path1;
    var fileName = path.normalize(pathname)
    fs.readFile(fileName, 'utf-8', function (err, data) {
      // console.log(data);
      console.log(fileName);
      var name = path.basename(fileName);
      // console.log(data);
      console.log(err);
      newModel(data, name);
      var id = editor.getModel().id;
      var draggables = '<div class="draggable" id="' + id + '"> <p id="' + fileName + '" class="tabtext">' + name + '</p> <p class="closebtn" id="' + id + '" onClick = "closeTab(this);"> × </p> </div>'
      deleteFrontPage();
      $('#tab').append(draggables);
      makeactive(id);
      $("#tab").sortable("refresh");
      editor.getModel().onDidChangeContent((event) => {
        console.log(editor.getModel().id);
        $(".active").children(".closebtn").html("•");
      });
    })
  }
}

function openMenuFile_remote(value) {
  var name = $(value).children(".thirdcol").text();
  var check = $('.draggable');
  var already_open = false;
  console.log(value.id);
  downloadFile_remote(0, function(value1){
    db.projects.find({_id: currentProject}, function(err,docs){
      var local_path = docs.map(function(element){
        return element.path;
      })
      console.log(local_path[0], value.id);
      value = local_path[0]+path.sep+value.id;
            for (i = 0; i < check.length; i++) { 
    if (value == check[i].children[0].id) {
      console.log(check[0]);
      makeactive(check[i].id);
      already_open = true;
    }
  }

  if (already_open == false) {
    var path1 = value.id;
    var pathname = path1;
    var fileName = path.normalize(value);
    fs.readFile(fileName, 'utf-8', function (err, data) {
      // console.log(data);
      console.log(fileName);
      var name = path.basename(fileName);
      // console.log(data);
      console.log(err);
      newModel(data, name);
      var id = editor.getModel().id;
      var draggables = '<div class="draggable" id="' + id + '"> <p id="' + fileName + '" class="tabtext">' + name + '</p> <p class="closebtn" id="' + id + '" onClick = "closeTab(this);"> × </p> </div>'
      deleteFrontPage();
      $('#tab').append(draggables);
      makeactive(id);
      $("#tab").sortable("refresh");
      editor.getModel().onDidChangeContent((event) => {
        console.log(editor.getModel().id);
        $(".active").children(".closebtn").html("•");
      });
    })
  }
    })
      

  })

}


function newFile() {

  newModel("// New File", "plaintext");
  var id = editor.getModel().id;
  var draggables = '<div class="draggable" id="' + id + '"> <p id="new" class="tabtext">New file</p> <p class="closebtn" id="' + id + '" onClick = "closeTab(this);"> • </p> </div>'

  $('#tab').append(draggables);
  makeactive(id);
  $("#tab").sortable("refresh");
  deleteFrontPage();
  editor.getModel().onDidChangeContent((event) => {
    console.log(editor.getModel().id);
    $(".active").children(".closebtn").html("•");
  })
}

function openFile() {


  dialog.showOpenDialog({

  }, function (fileNames) {

    if (fileNames === undefined) return;
    var fileName = fileNames[0];
    var data;
    fs.readFile(fileName, 'utf-8', function (err, data) {
      // console.log(data);
      console.log(fileName);
      var name = path.basename(fileName);
      newModel(data, name);
      var id = editor.getModel().id;
      var draggables = '<div class="draggable" id="' + id + '"> <p id="' + fileName + '" class="tabtext">' + name + '</p> <p class="closebtn" id="' + id + '"  onClick = "closeTab(this);"> × </p> </div>'

      $('#tab').append(draggables);
      makeactive(id);
      deleteFrontPage();
      $("#tab").sortable("refresh");
      editor.getModel().onDidChangeContent((event) => {
        console.log(editor.getModel().id);
        $(".active").children(".closebtn").html("•");
      });
    })
  });

}



function saveFile() {
  let content = editor.getValue();
  var activetab = $(".active").children(".tabtext")[0];
  var fileName = activetab.id;
  // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
  if (fileName == "new") {
    dialog.showSaveDialog({ defaultPath: "./newfile" }, function (fileName) {
      if (fileName === undefined) {
        console.log("You didn't save the file");
        return;
      }
      fs.writeFile(fileName, content, (err) => {
        if (err) {
          console.log("An error ocurred creating the file " + err.message)
        }
        activetab.id = fileName;
        activetab.innerHTML = path.basename(fileName);
        console.log("The file has been succesfully saved");
        $(".active").children(".closebtn").html("×");

        var language = fileName.split('.').pop()
        console.log(language);
        if (language == "js") {
          language = "javascript";
        }
        var model = editor.getModel(); // we'll create a model for you if the editor created from string value.
        monaco.editor.setModelLanguage(model, language)
      })
    })
  } else {

    fs.exists(fileName, function (exists) {
      if (exists) {
        fs.writeFile(fileName, content, (err) => {
          if (err) {
            console.log("An error ocurred creating the file " + err.message)
          }

          console.log("The file has been succesfully saved");
          $(".active").children(".closebtn").html("×");
        })
      }
      else {
        var name = path.basename(fileName);
        dialog.showSaveDialog({ defaultPath: "./" + name + "" }, function (fileName) {
          if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
          }
          fs.writeFile(fileName, content, (err) => {
            if (err) {
              console.log("An error ocurred creating the file " + err.message)
            }

            console.log("The file has been succesfully saved");
            $(".active").children(".closebtn").html("×");

          })
        })
      }
    })
  }
}




//////////////////////////////////////////
// FINE CODICI PER LA GESTIONE DEI FILE //
//////////////////////////////////////////


