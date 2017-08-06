### Zoom Meeting CSV Parser 
A simple [Zoom](https://zoom.us/) meeting csv parser.

(This software is considered alpha quality and is subject to change without notice)

#### Basic Usage
```javascript 
const { zsv: zoom, deDupeByName, deDupeByIP, group, minutesInMeeting, camelCaseFields } = require('./index');
// transformations are optional, you may supply your own or none at all
zoom('example.csv', deDupeByName, flatten)
  .then(data => {
    const [hosts, participants] = data;

    // Do stuff with your hosts and participants
    console.log(hosts);
    console.log(participants);
  })
  .catch(error => {
    // Handle error
    console.log(error.message);
  });
```

