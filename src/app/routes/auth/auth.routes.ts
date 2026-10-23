import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OtpComponent } from './register/otp/otp.component';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './register/reset/reset.component';
import { AuthLayoutComponent } from './auth-layout';

export default [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'reset',
    component: AuthLayoutComponent,
    children: [{ path: '', component: ResetComponent }],
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [{ path: '', component: LoginComponent }],
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    children: [
      { path: '', component: RegisterComponent },
      { path: 'otp', component: OtpComponent },
      { path: 'reset', component: ResetComponent },
    ],
  },
] as Route[];
