import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DepthBg } from '@shared/components/backgrounds/depth-bg';
import { AuthHeader } from './auth-header/auth-header';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AuthHeader, DepthBg],
  template: `
    <div class="bg-white/20 size-full relative flex flex-col ">
      <!-- Background layers -->

      <div
        class="size-full backdrop-blur-[2px] top-0 left-0 absolute dark:opacity-35 opacity-15  "
        style="background: radial-gradient(circle, var(--color-secondary), transparent);  "
      ></div>

      <div class="absolute inset-0 opacity-25">
        <depth-bg />
      </div>

      <auth-header />

      <div class="grow relative overflow-y-auto flex flex-col justify-center items-center  p-3">
        <div class="w-full grow relative">
          <!--  -->
          <router-outlet />
          <!--  -->
        </div>

        <!-- Footer -->
        <!-- <footer class="  {{ animation }} --order-7">
        <p class="text-xs text-center text-gray-500">
          © {{ currentYear }} {{ 'owner' | appVariables }}. All rights reserved.
        </p>
      </footer> -->
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
