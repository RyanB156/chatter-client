import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../domain/error-handler';
import { KeyManager } from '../domain/security/key-manager';
import { catchError } from 'rxjs/operators';

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

//let ciphertext = manager.encrypt(manager.publicKey, 'hello world');
//manager.decrypt(manager.privateKey, ciphertext);

//let passwordHash = manager.hash(this.password);

  async login() {
  
    let passwordHash = await KeyManager.hash(this.password);
    console.log('hash:', passwordHash);
    console.log('->', passwordHash);
    let user = {username: this.username, passwordHash: passwordHash};
    console.log(user);
    this.http.post('http://localhost:3000/users/login', user, {responseType: 'json'})
              .pipe(catchError(handleError(this.loginError)))
              .subscribe(result => {
              console.log(`result:`, result);
                this.onSuccessfulLogin(result);
              });
  }

  loginError = () => {
    this.isLoginError = true;
  }

  onSuccessfulLogin(result) {
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
    let keys = await KeyManager.generateKeys();

    let user = {username: this.username, passwordHash: passwordHash, publicKey: keys.publicKey};
    console.log(user);
    this.http.post('http://localhost:3000/users/register', user, {responseType: 'text'})
             .pipe(catchError(handleError(this.registerError)))
             .subscribe(result => {
               console.log(`result:`, result);
               this.onSuccessfulRegistration(keys.privateKey);
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
    this.isLoggingIn = true;
    localStorage.setItem('privateKey', privateKey);
    this.router.navigateByUrl('connect/login').then(() => location.reload());
  }

  createAccount(): void {
    this.router.navigateByUrl('connect/register');
    this.isLoggingIn = false;
    this.isLoginError = false;
    this.isRegisterError = false;
  }

}
