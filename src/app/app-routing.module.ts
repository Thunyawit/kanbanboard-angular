import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BoardListComponent } from './board-liast/board-liast.component';
import { BoardDetailComponent } from './board-detail/board-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },//เริ่มหน้าด้วยlogin นะจ้ะ
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'boards', component: BoardListComponent },
  { path: 'boards/:boardId', component: BoardDetailComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
