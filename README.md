# Zoom Meeting CSV Parser

A simple [Zoom](https://zoom.us/) meeting and webinar csv parser.

## Basic Usage

```javascript
import {
  zoom,

  // transformations
  camelCase,
  compact,
  deDupeByName,
  deDupeByIP,
  flatten,
  group,
  minutesInMeeting,
  pluck,
  toArray,
} from 'zsv';

// transformations are optional, you may supply your own or none at all
const [hosts, participants] = await zoom('example.csv', deDupeByName, camelCase, flatten);

// Do stuff with your hosts and participants
console.log(hosts);
console.log(participants);
```

### Unaltered Meeting Participant

```javascript
{
  participant: "archer",
  device: "Mac",
  ip_address: "192.168.241.19",
  location: "Milpitas (US )",
  network_type: "Wifi",
  join_time: "06:00 AM",
  leave_time: "06:03 AM",
  version: "3.5.64836.0908",
  audio__receiving_bitrate: "79 kbps",
  audio__sending_bitrate: "-",
  audio__receiving_latency: "77 ms",
  audio__sending_latency: "-",
  audio__receiving_jitter: "8 ms",
  audio__sending_jitter: "-",
  audio__receiving_packet_loss_avg_max: "0.15 %(0.65 %)",
  audio__sending_packet_loss_avg_max: "-(-)",
  video__receiving_bitrate: "-",
  video__sending_bitrate: "-",
  video__receiving_latency: "77 ms",
  video__sending_latency: "-",
  video__receiving_jitter: "9 ms",
  video__sending_jitter: "-",
  video__receiving_packet_loss_avg_max: "-(-)",
  video__sending_packet_loss_avg_max: "-(-)",
  video__receiving_resolution: "-",
  video__sending_resolution: "-",
  video__receiving_frame_rate: "-",
  video__sending_frame_rate: "-",
  screen_sharing__receiving_bitrate: "155 kbps",
  screen_sharing__sending_bitrate: "155 kbps",
  screen_sharing__receiving_latency: "78 ms",
  screen_sharing__sending_latency: "78 ms",
  screen_sharing__receiving_jitter: "11 ms",
  screen_sharing__sending_jitter: "9 ms",
  screen_sharing__receiving_packet_loss_avg_max: "-(-)",
  screen_sharing__sending_packet_loss_avg_max: "-(-)",
  screen_sharing__receiving_resolution: "2560*1440",
  screen_sharing__sending_resolution: "2560*1440",
  screen_sharing__receiving_frame_rate: "16 fps",
  screen_sharing__sending_frame_rate: "19 fps",
  zoom_min_cpu_usage: "4 %",
  zoom_avg_cpu_usage: "8 %",
  zoom_max_cpu_usage: "11 %",
  system_max_cpu_usage: "23 %"
}
```

### Transformations

There are a number of included transformations that alter the structure of participant and host objects.

#### camelCase

Transforms fields to camel case

```javascript
await zoom('meeting.csv', camelCase);
```

Output:

```javascript
{
  participant: "archer",
  device: "Mac",
  ipAddress: "192.168.241.19",
  location: "Milpitas (US )",
  networkType: "Wifi",
  joinTime: "06:00 AM",
  leaveTime: "06:03 AM",
  ...
}
```

#### compact

Removes null and undefined values from webinar csv's

```javascript
await zoom('webinar.csv', compact);
```

#### deDupeByName

Merge participants based on name (participant). May contain arrays of values.

```javascript
await zoom('meeting.csv', deDupeByName);
```

Output:

```javascript
{
  participant: "archer",
  device: "Mac",
  ip_address: "192.168.241.19",
  location: "Milpitas (US )",
  network_type: "Wifi",
  join_time: ["06:00 AM", "06:11 AM"],
  leave_time: ["06:03 AM", "06:37 AM"],
  ...
}
```

#### deDupeByIP

Merge participants based on IP. May contain arrays of values.

```javascript
await zoom('meeting.csv', deDupeByIP);
```

Output:

```javascript
{
  participant: ["archer", "Archer"],
  device: "Mac",
  ip_address: "192.168.241.19",
  location: "Milpitas (US )",
  network_type: "Wifi",
  join_time: ["06:00 AM", "06:11 AM"],
  leave_time: ["06:03 AM", "06:37 AM"],
  ...
}
```

#### flatten

Flatten array values after deDuping.

```javascript
await zoom('meeting.csv', deDupeByIP, flatten);
```

Output:

```javascript
{
  participant: "archer",
  device: "Mac",
  ip_address: "192.168.241.19",
  location: "Milpitas (US )",
  network_type: "Wifi",
  join_time: "06:00 AM",
  leave_time: "06:37 AM",
  ...
}
```

#### group

Group creates objects from similar field names, such as:

```javascript
{
  screen_sharing__receiving_bitrate: "155 kbps",
  screen_sharing__sending_bitrate: "155 kbps"
}
```

```javascript
await zoom('meeting.csv', group);
```

Output:

```javascript
{
  screen_sharing: {
    receiving_bitrate: "155 kbps",
    sending_bitrate: "155 kbps",
    receiving_latency: "78 ms",
    sending_latency: "78 ms",
    receiving_jitter: "9 ms",
    sending_jitter: "9 ms",
    receiving_packet_loss_avg_max: "-(-)",
    sending_packet_loss_avg_max: "-(-)",
    receiving_resolution: "2560*1440",
    sending_resolution: "2560*1440",
    receiving_frame_rate: "16 fps",
    sending_frame_rate: "16 fps"
  },
  ...
}
```

#### minutesInMeeting

Attempts to calculate participant time spent in the meeting.  
Adds new property `minutes_in_meeting` by default, or `minutesInMeeting` if `camelCase` transform has been utilized.

```javascript
await zoom('meeting.csv', minutesInMeeting);
```

Output:

```javascript
{
  participant: "archer",
  device: "Mac",
  ip_address: "192.168.241.19",
  location: "Milpitas (US )",
  ...
  minutes_in_meeting: 3
}
```

#### pluck

Pluck takes a list of field names to create a new object.

```javascript
await zoom(
  'meeting.csv',
  pluck('participant', 'device', 'location', ['ip_address', 'network_type']),
);
```

Output:

```javascript
{
  participant: "archer",
  ip_address: "192.168.241.19",
  device: "Mac",
  network_type: "Wifi",
  location: "Milpitas (US )"
}
```

#### toArray

Creates an array of key value pairs.

Output:

```javascript
[
  [ 'participant', 'archer' ],
  [ 'device', 'Mac' ],
  [ 'ip_address', '192.168.241.19' ],
  [ 'location', 'Milpitas (US )' ],
  [ 'network_type', 'Wifi' ],
  [ 'join_time', '06:00 AM' ],
  [ 'leave_time', '06:03 AM' ],
  ...
]
```

Transforming with `group` before `toArray` will create multiple nested arrays.

```javascript
[
  ['participant', 'archer'],
  [
    'audio',
    [
      ['receiving_bitrate', '79 kbps'],
      ['sending_bitrate', '-'],
      ['receiving_latency', '77 ms'],
      ['sending_latency', '-'],
      ['receiving_jitter', '8 ms'],
      ['sending_jitter', '-'],
      ['receiving_packet_loss_avg_max', '0.15 %(0.65 %)'],
      ['sending_packet_loss_avg_max', '-(-)'],
    ],
  ],
];
```

### Custom Transforms

You may create your own custom transformations by supplying a function with the following interfaces:

```javascript
function doStuff(participants) {
  // do stuff with the participants array
  for (const participant of participants) {
    // things are happening
  }

  // return array of participants
  return participants;
}
```

or:

```javascript
function transform(field, value, participant) {
  // do stuff with participant

  participant[field] = `modified ${value}`;

  // return the modified participant
  return participant;
}
```

#### Caveats

Pluck attempts to transform both host and participant objects.  
If you plan to work with the host object it might behoove you to utilize `pluck` after you receive the data objects.

```javascript
const [hosts, participants] = await zoom('meeting.csv');
const plucked = pluck('participant', 'location')(participants);
```
