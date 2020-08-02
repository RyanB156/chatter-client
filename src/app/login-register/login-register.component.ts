import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss']
})
export class LoginRegisterComponent implements OnInit {

  isLoggingIn: boolean = true;
  username: string = '';
  password: string = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    let mode = this.route.snapshot.paramMap.get('mode');
    if (mode === 'register') {
      this.isLoggingIn = false;
    }
  }

  submit(): void {
    console.log(`Submitting ${this.username}, ${this.password}`);
  }

  createAccount(): void {
    this.isLoggingIn = false;
  }

}
