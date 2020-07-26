import { Component, OnInit } from '@angular/core';
import { Message } from '../message/message.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  username: string = 'A';
  friendUsername: string = 'B';
  messageBody: string = '';
  private millisPerMinute = 60_000;

  messages: Message[] = [];

  baseMessages: Message[] = [
    new Message('A', 'B', new Date(Date.now() - 10 * this.millisPerMinute), 'Hi! How are you doing?'),
    new Message('B', 'A', new Date(Date.now() - 9 * this.millisPerMinute), 'Hey. I am doing well, how about you?'),
    new Message('A', 'B', new Date(Date.now() - 5 * this.millisPerMinute), 'Good'),
    new Message('A', 'B', new Date(Date.now() - 0.5 * this.millisPerMinute), 'Whatcha been up to?'),
    new Message('B', 'A', new Date(Date.now() - 0.25 * this.millisPerMinute), 'I graduated from school with my Bachelor\'s in Computer Science and I just started a job with Honeywell in Raleigh, NC. Everything is going well so far. It\'s good to be starting my career.'),
  ];

  constructor(private http: HttpClient) { 

  }

  ngOnInit(): void {
    console.log(`Subscribing: ${this.username}, ${this.friendUsername}`);
    this.http.get<Message[]>(`https://localhost:1443/messages/?conversation=${this.username}-${this.friendUsername}`).subscribe(data => {
      this.messages = [];
      data.forEach(message => {
        message.timestamp = new Date(message['timestamp']);
        this.messages.push(message);
      })
    });
  }

  buttonClick(): void {
    this.ngOnInit();
  }

}
