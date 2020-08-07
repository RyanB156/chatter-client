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
      -> Home

    Register - User clicks on "Register" and enters information to create an account. Then login.
      User enters username
      User enters password
      Client creates public and private keys √
      Send username, H(password), and public key to Server √
      Save private key in local storage and inform the user that they need to save it √
      -> Login

    View list of conversations - User navigates to Home and sees a list of conversations for the current user
      User is signed in
      User clicks on "Home"
      Client submits access request with username and session key
      Server checks the session key against the username (Don't trust the client saying it is logged in)
      If logged in, Server admits the request and returns the list of conversations. Else, return error
      Client displays the conversations to the user

    View messages in a conversation - User clicks on an active conversation from Home and sees all messages in that conversation
      User is signed in and at Home, view a list of conversations
      User clicks on a conversation
      Client requests all messages from the conversation from Server, with username and session key
      Server validates request
      Server returns all messages in the conversation
      Client displays messages in a nice format
      

      (conversation also stores the participants' public keys)

    Create a new conversation - User clicks on "New Conversation"

    Create a new message - User clicks on "New Message"


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
    localStorage.setItem('sessionKey', result['sessionKey']);
    localStorage.setItem('publicKey', result['publicKey']);
    localStorage.setItem('privateKey', this.privateKey);
    localStorage.setItem('username', this.username);

    console.log('localStorage:', localStorage);
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
