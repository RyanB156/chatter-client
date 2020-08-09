import { Component, OnInit } from '@angular/core';
import { Message } from '../message/message.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { handleError } from '../domain/error-handler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  conversations: object[] = [];
  loginData: string = localStorage['username'];
  showCreateConversation: boolean = false;
  newConversationUsername: string = '';
  newConversationError: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {

    if (localStorage['isLoggedIn'] != 'true') {
      this.router.navigateByUrl('connect/login');
    }
    let body = {username: localStorage['username'], sessionKey: localStorage['sessionKey']};
    this.http.post(`http://localhost:3000/conversations/all`, body, {observe: 'response'})
    .subscribe(response => {
      console.log(response);
      if (response.status === 200) {
        console.log(response['body']);    
        for (let key in response['body']) {
          this.conversations.push(response['body'][key]);
        }
        console.log(this.conversations);
      }
    }, error => console.log(error));
  }

  formatConversation(index: number) {
    return Object.keys(this.conversations[index])[0];
  }

  makeNewConversation() {
    this.showCreateConversation = true;
  }

  cancelNewConversation() {
    this.showCreateConversation = false;
  }

  sendNewConversation() {
    this.newConversationError = false;

    let body = {
      username: localStorage['username'],
      sessionKey: localStorage['sessionKey'],
      otherUsername: this.newConversationUsername
    };

    console.log('Sending', body);

    this.http.post('http://localhost:3000/conversations/add', body, {responseType: 'text'})
            .pipe(catchError(handleError(this.onNewConversationError)))
            .subscribe(result => {
              console.log('result:', result);
              this.onNewConversationSuccess();
            })

    /*
      this.http.post('http://localhost:3000/users/register', user, {responseType: 'text'})
             .pipe(catchError(handleError(this.registerError)))
             .subscribe(result => {
               console.log(`result:`, result);
               this.onSuccessfulRegistration(this.manager.privateKey);
             });
    */
  }

  onNewConversationSuccess = () => {
    location.reload();
  }

  onNewConversationError = () => {
    this.newConversationError = true;
  }

}
