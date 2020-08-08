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

  username: string = '';
  friendUsername: string = '';
  messageBody: string = '';

  messages: Message[] = [];
  conversationData: string = '';

  buttonClick(): void {
    this.ngOnInit();
  }

  sendMessage(): void {
    if (this.messageBody.trim() != '') {
      let message = new Message(this.username, this.friendUsername, new Date(Date.now()), this.messageBody);
      console.log(`Sending ${JSON.stringify(message)}`);

      this.http.post(`https://localhost:1443/messages/add`, message).subscribe(data => {
          console.log(data);
        });
      this.messageBody = '';
    }
  }

  ngOnInit(): void {
    let conversation: string = this.route.snapshot.paramMap.get('conversation');
    let participants = conversation.split('-');
    this.username = participants[0];
    this.friendUsername = participants[1];
    this.messages = [];
    this.http.get(`https://localhost:1443/messages/${conversation}`, {observe: 'response'})
    .subscribe(response => {
      if (response.status === 200) {
        
        /*
        response['body'].forEach(message => {
          message.timestamp = new Date(message['timestamp']);
          this.messages.push(message);
        });
        */
       console.log('Received:', response['body']);
       this.conversationData = JSON.stringify(response['body']);
      }
    }, error => console.log(error));
  }

}
