import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ConversationViewComponent } from './conversation-view/conversation-view.component';
import { LoginRegisterComponent } from './login-register/login-register.component';

const routes: Routes = [
  { path: 'conversation/:conversation', component: ConversationViewComponent },
  { path: 'home', component: HomeComponent },
  { path: 'connect/:mode', component: LoginRegisterComponent },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
