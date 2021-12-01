import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyPolicy } from './privacy-policy.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PrivacyPolicy],
  exports: [PrivacyPolicy]
})
export class PrivacyPolicyModule {}
