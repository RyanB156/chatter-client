import { Component, OnInit } from '@angular/core';
import { Message } from '../message/message.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  conversations: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Message[]>(`https://localhost:1443/messages/all`, {observe: 'response'})
    .subscribe(response => {
      console.log(response);
      if (response.status === 200) {
        console.log(response['body']);
        for (let key in response['body']) {
          this.conversations.push(key);
        }
      }
    }, error => console.log(error));

  }

}
