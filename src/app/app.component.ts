import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'message-client';
  isLoggedIn = localStorage['isLoggedIn'] == 'true';
  username = localStorage['username'];
  
  constructor(private router: Router) {
    
  }

  logout() {
    localStorage.setItem('isLoggedIn', 'false');
    this.router.navigateByUrl('/connect/login').then(() => location.reload());
  }

}

