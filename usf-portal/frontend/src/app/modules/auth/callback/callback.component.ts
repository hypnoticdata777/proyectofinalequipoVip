import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [],
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A2540;">
      <div style="text-align:center;color:white;">
        <div style="width:60px;height:60px;border:4px solid #D4AF37;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;"></div>
        <p style="font-size:1.1rem;">Redirigiendo...</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      </div>
    </div>
  `,
})
export class CallbackComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['/auth/login']);
  }
}
