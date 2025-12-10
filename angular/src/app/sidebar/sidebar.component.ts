import { Component, Input, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  @Input() isChatMode: boolean = false;

  @HostBinding('class.chat-mode') get chatModeClass() {
    return this.isChatMode;
  }

  constructor() { }

  ngOnInit(): void {
    console.log('Sidebar chat mode:', this.isChatMode);
  }
currentColor = '#c7a8e8';

  onColorChange(event: any) {
    const val = event.target.value;
    this.currentColor = val;
    document.documentElement.style.setProperty('--primary', val);
    document.documentElement.style.setProperty('--sidebar-active', val);
    document.documentElement.style.setProperty('--primary-dark', this.shadeColor(val, -15));
  }

  setTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--main-bg', '#181824');
      root.style.setProperty('--sidebar-bg', '#232338');
      root.style.setProperty('--chat-bot-bg', '#22243c');
      root.style.setProperty('--chat-user-bg', 'linear-gradient(90deg,#43cea2,#185a9d)');
      root.style.setProperty('--text', '#f6f6fb');
    } else {
      root.style.setProperty('--main-bg', '#fff');
      root.style.setProperty('--sidebar-bg', '#f6f6fa');
      root.style.setProperty('--chat-bot-bg', '#ededed');
      root.style.setProperty('--chat-user-bg', 'linear-gradient(90deg,#43cea2,#185a9d)');
      root.style.setProperty('--text', '#222');
    }
  }

  shadeColor(color: string, percent: number): string {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);
    R = Math.min(255, parseInt((R * (100 + percent) / 100).toString()));
    G = Math.min(255, parseInt((G * (100 + percent) / 100).toString()));
    B = Math.min(255, parseInt((B * (100 + percent) / 100).toString()));
    return "#" + (0x1000000 + (R<<16) + (G<<8) + B).toString(16).slice(1);
  }
}
