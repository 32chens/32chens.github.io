var spawn = require('child_process').exec;
hexo.on('new', function(data){
  spawn('start  "C:\WebApps\Typora\Typora.exe" ' + data.path);
});