import { Routes } from '@angular/router';
import { WaitComponent } from './wait/wait.component';
import { BlocdashComponent } from './blocdash/blocdash.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

import { EnichatbotComponent } from './enichatbot/enichatbot.component';
import { EventsComponent } from './events/events.component';
import { CitystatsComponent } from './citystats/citystats.component';
import { ContactComponent } from './contact/contact.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'wait', pathMatch: 'full' },

  // Tes anciens composants
  { path: 'wait', component: WaitComponent },
  { path: 'blocdash', component: BlocdashComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'sidebar', component: SidebarComponent },

  // Nouveaux composants
  { path: 'enichatbot', component: EnichatbotComponent },
  { path: 'events', component: EventsComponent },
  { path: 'citystats', component: CitystatsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'settings', component: SettingsComponent },
];
