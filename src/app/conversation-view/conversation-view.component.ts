import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../message/message.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-conversation-view',
  templateUrl: './conversation-view.component.html',
  styleUrls: ['./conversation-view.component.scss']
})
export class ConversationViewComponent implements OnInit {

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  username: string = 'A';
  friendUsername: string = 'B';
  messageBody: string = '';

  messages: Message[] = [];

  buttonClick(): void {
    this.ngOnInit();
  }

  sendMessage(): void {
    if (this.messageBody.trim() != '') {
      let message = new Message(this.username, this.friendUsername, new Date(Date.now()), this.messageBody);
      console.log(`Sending ${JSON.stringify(message)}`);

      this.http.post(
        `https://localhost:1443/messages/add`, message).subscribe(data => {
          console.log(data);
        });
      this.messageBody = '';
    }
  }

  ngOnInit(): void {
    let conversation: string = this.route.snapshot.paramMap.get('conversation');
    this.messages = [];
    this.http.get<Message[]>(`https://localhost:1443/messages/${conversation}`, {observe: 'response'})
    .subscribe(response => {
      if (response.status === 200) {
        response['body'].forEach(message => {
          message.timestamp = new Date(message['timestamp']);
          this.messages.push(message);
        });
      }
    }, error => console.log(error));
  }

}