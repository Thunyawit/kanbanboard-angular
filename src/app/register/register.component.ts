import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/authservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // ส่งข้อมูลโดยไม่ต้องส่ง confirmPassword ไปให้ backend
      this.authService.register(this.registerForm.value).subscribe(
        (response) => {
          // หลังจาก register สำเร็จ สามารถเปลี่ยนเส้นทางไปยังหน้า login
          this.router.navigate(['/login']);
        },
        (error) => {
          this.errorMessage = 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง';
        }
      );
    }
  }
}
