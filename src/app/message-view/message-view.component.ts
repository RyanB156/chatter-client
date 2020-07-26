import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { Message } from '../message/message.component';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit, AfterContentInit {
@Input() messages: Message[];
@Input() username: string;
  constructor() { 

  }

  ngAfterContentInit(): void {
    this.messages.forEach(m => {
      console.log(`${this.username}, ${m.sender}`)
      console.log(m.sender === this.username);
    });
  }

  ngOnInit(): void {
  }

}
