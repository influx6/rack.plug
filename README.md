# Fs.plug
  File system modules for the plugd framework. It provides the plugs for basic file system operations and abit more, to allow the performing of file operations using the plug framework.
  
# Plugs

* File.Read: This plug provide the standard file read operation and listens on for tasks that match its giving tag/id upon its instantiation and returns a reply with stream of data from the file if found else with an error.
  
* File.Write.New: as its name,takes a task with a meta containing the file path to write to (i.e file must not exisit else be overwritten) and the streams as the data to write into the file

* File.Write.Append: appends the stream of data from the task into the file supplied in the task meta if the file exists

* Dir.read: reads the directory provided in the task meta if it exists and sends the listings as individual stream data in the reply emitted

* Dir.write: creates a new directory in accordance with the meta details. 

* Dir.Overwrite: overwrites the directory with a new one from the path giving in the task's meta

* Dir.Destroy: unlinks the directory giving in the task's meta

* File.Destroy: unlinks a file according to the path giving with the task's meta

* File.Check: checks existence of the path in the task's meta

* Stat: returns a reply containing the stat of the giving path

* Symlink.Read: reads the symlink path according to the giving path in the task's meta

* Symlink.Write: creates a symlink according to the paths giving in the task's meta for source and destination

* Fs.BaseFs: This plug proxies tasks of a particular directory into the network stream its connected to, i.e it checks all io requests coming to it according to its giving tags and vets if the paths fall within the root path set for it else rejects them. Its a nice way of ensuring io requests don't move beyond their giving root paths

* Fs.ioControl: This is a special plug that restricts all fs operations into a particular directory using the Fs.BaseFs plug and contains its own internal network of major [Fs.Plug][fs.url] plugs. If any fs tasks come into its stream with the path of that request not within the set directory root, that task is ignored and rejected else is allowed to propagate into a internal network that contains all the plugs within the [Fs.Plug][fs.url],it has as a means of ensuring only fs operations are restricted to a specific path.

## Tasks Meta Format

* File.Read, File.Write.New, File.Write.Append, File.Destroy, Dir.read, Dir.write, Dir.Overwrite, Dir.Destroy, File.Check, Stat, Symlink.Read:
  These require that tasks have their meta in this format: { file: path_to_file } eg. 
    a plug of any of these, tagged as 'reader'

    ```javascript
    
        plug.Tasks.make('reader',{ file: './locator.js' })
        
    ```  

* Symlink.Write: 
  It require that tasks have their meta in this format: { src: path_for_linking , dest: path_to_link } eg. 
    a plug for symlink.write tagged as 'sym.commander'

    ```javascript
    
        plug.Tasks.make('sym.commander',{ src: './root/box', desc: './fluxter/boombox' })
        
    ```  

* Fs.ioControl: 
 This type of plug comes with two task channels, one for configuration and the other for io tasks proxying. The configuration channel is tagged: 'io.control.conf' and when it receives a valid tasks with format { base: path_base} it resumes its default task channel and checks for all tasks with meta format { task: 'fs_task', file: 'path_wanted' }, if the file parameter is within its set roots,it creates a new task with the task and file path as the body from the meta object and sends it off into its internal network that contains all [Fs.Plug][fs.url]. Usually you would want only one of these in your network but you can use as many as possible,once its configuration its set,its never changes,so you don't even need to bother about who is restricting to what path,add all the number of directories you want to lock to,each will immediately on get the first task,set and lock itself to that while the rest peek the remaining packets setting themselves.
 
 Internal Channels: (1 total)
  * io.Control.conf -> *used for setting configuration,i.e the base root for guarding with*
 
      ```javascript
          
          plug.Tasks.make('io.control.conf',{ base: './root/box' })
                
          //with io.Control tagged 'io.Commander'
          plug.Tasks.make('io.Commander',{ task: 'file.read', file:'red.txt' });
                
      ```  

[fs.url]: https://github.com/influx6/fs.plug
