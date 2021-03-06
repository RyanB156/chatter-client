import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from '../message/message.component';
import { HttpClient } from '@angular/common/http';
import { KeyManager } from '../domain/security/key-manager';

@Component({
  selector: 'app-conversation-view',
  templateUrl: './conversation-view.component.html',
  styleUrls: ['./conversation-view.component.scss']
})
export class ConversationViewComponent implements OnInit {

  username: string = '';
  friendUsername: string = '';
  conversation: string = '';
  messageBody: string = '';
  publicKeys: object;
  messages: any[] = [];
  conversationData: string;
  lastTimestamp: Date = undefined;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

/*
  Need to separate messages transmitted and messages displayed...
  message = {sender, receiver, timestamp, body}
  senderViewable = E(sender_PK, message)
  receiverViewable = E(receiver_PK, message)
  Send {sender, senderViewable, receiver, receiverViewable, timestamp}
  Receive {senderViewable, sender_PK, receiver_PK} on refresh
*/

  ngOnInit(): void {
    this.conversation = this.route.snapshot.paramMap.get('conversation');
    let participants = this.conversation.split('-');
    this.username = localStorage['username'];
    this.friendUsername = (this.username === participants[0]) ? participants[1] : participants[0];
    
    this.reload();
  }

  reload(): void {
    let body = {username: localStorage['username'], sessionKey: localStorage['sessionKey']};
    this.http.post(`http://localhost:3000/conversations/view?conversationCode=${this.conversation}&timestamp=${this.lastTimestamp}`, body, {observe: 'response'})
    .subscribe(response => {
      if (response.status === 200) {
        
        console.log('Received:', response['body']);
        console.log(response['body'][this.conversation]);
        let newMessages = response['body'][this.conversation]['messages']
        this.publicKeys = response['body'][this.conversation]['publicKeys'];

        newMessages.forEach(message => {
          message[this.username] = KeyManager.decrypt(message[this.username], localStorage['privateKey'])['message'];
          message['timestamp'] = new Date(message['timestamp']);
          console.log(message);
        });

        this.messages = this.messages.concat(newMessages);

        // Track the timestamp of the last received message to request only new messages.
        console.log(this.messages);
        this.lastTimestamp = this.messages[this.messages.length - 1]['timestamp'];
        
      }
    }, error => {
      console.log(error);
      if (error['status'] === 400) {
        this.router.navigateByUrl('/home');
      }
    });
  }

  sendMessage(): void {
    if (this.messageBody.trim() != '') {
      let m = {
        sender: this.username,
        receiver: this.friendUsername,
        timestamp: new Date(Date.now())
      }

      let sc = KeyManager.encrypt(this.messageBody, localStorage['publicKey']);
      let sm = KeyManager.decrypt(sc, localStorage['privateKey']);
      console.log(`Encrypting ${this.messageBody} to sender viewable ${JSON.stringify(sc)}`);
      console.log(`Decrypting sender viewable ${JSON.stringify(sc)} to ${JSON.stringify(sm)} `);

      console.log('publicKeys: ', JSON.stringify(this.publicKeys));
      let rc = KeyManager.encrypt(this.messageBody, this.publicKeys[this.friendUsername])

      m[this.username] = sc; // Encrypted message
      m[this.friendUsername] = rc; // Encrypted message
      
      console.log(`Sending ${JSON.stringify(m)}`);
      let body = {username: localStorage['username'], sessionKey: localStorage['sessionKey'], message: m};
      this.http.post(`http://localhost:3000/messages/add`, body).subscribe(data => {
          console.log(data);
        });
      this.messageBody = '';
    }
  }  

}
