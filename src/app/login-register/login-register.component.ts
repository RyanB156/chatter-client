import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeyManager } from '../domain/security/key-manager';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss']
})
export class LoginRegisterComponent implements OnInit {

  isLoggingIn: boolean = true;
  isRegisterError: boolean = false;
  isLoginError: boolean = false;
  username: string = '';
  password: string = '';
  privateKey: string = localStorage.getItem('privateKey');

  manager: KeyManager = new KeyManager();

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    console.log(this.route.snapshot.paramMap);
    let mode = this.route.snapshot.paramMap.get('mode');
    if (mode === 'register') {
      this.isLoggingIn = false;
    }
  }

  copyPrivateKey(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  /*
    Test users:
      username: A, password: 1234
      username: B, password: 1234
  */

  /*
    TODO:

    documentation comments

    Login - 
      User enters username √
      User enters password √
      User enters privateKey (or it is loaded from local storage if it exists) √
      User clicks "Submit" √
      Send username and password hash to server √
      Server checks for existence of username √
      Server checks password hash against the existing user with that username √
      Server generates random session key for the user, returns it and the user's public key, and tells the user they are logged in √
      Client saves session key. Also save current username in local storage. √
      => Home

    Logout
      User clicks "Logout" √
      Client sets localStorage['isLogged'in] to 'false' √
      Client navigates to Login √
      Client updates menu bar to reflect signin status √

    Register - User clicks on "Register" and enters information to create an account. Then login.
      User enters username √
      User enters password √
      Client creates public and private keys √
      Send username, H(password), and public key to Server √
      Save private key in local storage and inform the user that they need to save it √
      -> Login

    View list of conversations - User navigates to Home and sees a list of conversations for the current user
      User is signed in √
      User clicks on "Home" if not there already √
      Client submits access request with username and session key
      Server checks the session key against the username (Don't trust the client saying it is logged in)
      If logged in, Server admits the request and returns the list of conversations which contains. Else, return error
      Client displays the conversations to the user

    Start view of messages in a conversation - User clicks on an active conversation from Home and sees all messages in that conversation
      User is signed in and at Home, viewing a list of conversations
      User clicks on a conversation
      -> View messages in a conversation
      
    View messages in a conversation
      Client requests all User decryptable messages under the current conversationID
      Server validates request
      Server returns all User decryptable messages under the current conversationID
      Client decrypts all User decryptable messages
      Client displays messages in a nice format

      (conversation also stores the participants' public keys)

    Create a new conversation - User clicks on "New Conversation" and starts communicating with another user
      User is signed in
      User clicks on "Home" if not there already
      User clicks on "New Conversation"
      Client navigates to CreateNewConversation
      User enters a recipient username
      User clicks "Search"
      Client sends username to Server
      Server checks if the username matches an existing user. If not, notify Client of the error.
      Server creates new empty conversation and saves it
      Server sends empty conversation with the public keys of both Users
      Client displays empty conversation

    Create a new message - User clicks on "New Message"
      User is signed in and viewing a conversation
      User enters message body
      User clicks "Send"
      Client creates message {timestamp, User's username, Other User's username, message body}
      Client creates User decryptable message with User's public key
      Client creates Other User decryptable message with Other User's public key
      Client creates request {conversationID, User decryptable message, Other User decryptable message}
      Client creates signedRequest {S(request, User's private key)} (Get basic encryption/decryption working first...)
      Client sends request, (signedRequest), username, and session key
      Server validates request
      Server stores the User decryptable message and Other User decryptable message separately under the conversation ID
      User clicks "Refresh"
      -> View messages in a conversation

    Timeout user account after inactivity

    Display Login or Register on the titlebar (only one at a time)

    -Security Requirements
      Sender encrypts and signs message using RSA keys.
      Server and Receiver verify tag of messages and the Sender.
      Require valid (matching) session key in all requests
  */

//let ciphertext = manager.encrypt(manager.publicKey, 'hello world');
//manager.decrypt(manager.privateKey, ciphertext);

//let passwordHash = manager.hash(this.password);

  async login() {
  
    let passwordHash = await KeyManager.hash(this.password);
    console.log('hash:', passwordHash);
    console.log('->', passwordHash);
    let user = {username: this.username, passwordHash: passwordHash};
    console.log(user);
    this.http.post('https://localhost:1443/users/login', user, {responseType: 'json'})
              .pipe(catchError(this.handleError(this.loginError)))
              .subscribe(result => {
              console.log(`result:`, result);
                this.onSuccessfulLogin(result);
              });
  }

  loginError = () => {
    this.isLoginError = true;
  }

  onSuccessfulLogin(result) {
    alert('logged in');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('sessionKey', result['sessionKey']);
    localStorage.setItem('publicKey', result['publicKey']);1
    localStorage.setItem('privateKey', this.privateKey);
    localStorage.setItem('username', this.username);

    console.log('localStorage:', localStorage);
    this.router.navigateByUrl('/home').then(() => location.reload());
  }

  async register() {
    this.isRegisterError = false;
    let passwordHash = await KeyManager.hash(this.password);
    console.log('hash:', passwordHash);
    await this.manager.generateKeys();

    let user = {username: this.username, passwordHash: passwordHash, publicKey: this.manager.publicKey};
    console.log(user);
    this.http.post('https://localhost:1443/users/register', user, {responseType: 'text'})
             .pipe(catchError(this.handleError(this.registerError)))
             .subscribe(result => {
               console.log(`result:`, result);
               this.onSuccessfulRegistration(this.manager.privateKey);
             });
  }

  registerError = () => {
    this.isRegisterError = true;
  }

  /**
   * To run after the user has been registered successfully. 
   * @param privateKey 
   */
  onSuccessfulRegistration(privateKey) {
    this.router.navigateByUrl('connect/login');
    this.isLoggingIn = true;
    localStorage.setItem('privateKey', privateKey);
  }

  createAccount(): void {
    this.router.navigateByUrl('connect/register');
    this.isLoggingIn = false;
    this.isLoginError = false;
    this.isRegisterError = false;
  }

  handleError = callback => function(error) {
    callback();
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
        // client-side error
        errorMessage = `Error: ${error.error.message}`;
    } else {
        // server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}
