import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() sender: string;
  @Input() timestamp: Date;
  @Input() body: string;
  constructor() { }

  ngOnInit(): void {
  }

  formattedDateTime() {
    var hourFormatted;
    let hour = this.timestamp.getHours();
    let timeTag = hour < 12 ? 'AM' : 'PM';

    if (hour === 0) {
      hourFormatted = '12';
    } else if (hour > 12) {
      hourFormatted = `${hour - 12}`;
    } else {
      hourFormatted = hour + '';
    }

    new Date(2020, 7, 23, 0, 15, 0)
    return `${hourFormatted}:${this.timestamp.getMinutes().toString().padStart(2, '0')} ${timeTag}, ${this.timestamp.getMonth() + 1}/${this.timestamp.getDate()}/${this.timestamp.getFullYear()}`
  }

}

export class Message {
  sender: string;
  receiver: string;
  timestamp: Date;
  body: string;

  constructor(sender, receiver, timestamp, body) {
    this.sender = sender;
    this.receiver = receiver;
    this.timestamp = timestamp;
    this.body = body;
  }
}