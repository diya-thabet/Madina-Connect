import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

import { EnichatbotComponent } from '../enichatbot/enichatbot.component';
import { EventsComponent } from '../events/events.component';
import { CitystatsComponent } from '../citystats/citystats.component';
import { ContactComponent } from '../contact/contact.component';
import { SettingsComponent } from '../settings/settings.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blocdash',
  standalone: true,
  imports: [
    NavbarComponent,
    SidebarComponent,
    EnichatbotComponent,
    EventsComponent,
    CitystatsComponent,
    ContactComponent,
    SettingsComponent,
    FormsModule,    
    CommonModule
  ],
  templateUrl: './blocdash.component.html',
  styleUrls: ['./blocdash.component.css']  // Correction orthographe
})
export class BlocdashComponent {
  selectedTab = 0;  // Initialisation sur Claim

  // Pour la partie que tu as, tu peux garder :
  activeAction: string = 'PDF';

  actions = [
    { name: 'PDF', icon: 'bi-file-earmark-text' },
    { name: 'Email', icon: 'bi-envelope' },
    { name: 'Payment', icon: 'bi-credit-card' }
  ];

  setActive(actionName: string): void {
    this.activeAction = actionName;
  }

  stepIndex = 0;
  today = new Date().toISOString().split('T')[0];

  nextStep() {
    if (this.stepIndex < 3) this.stepIndex++;
  }

  prevStep() {
    if (this.stepIndex > 0) this.stepIndex--;
  }

  submitForm() {
    alert('✅ Formulaire soumis avec succès !');
  }

  onTabSelected(index: number) {
    this.selectedTab = index;
  }
}

