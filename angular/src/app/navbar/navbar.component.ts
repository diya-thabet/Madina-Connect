import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] 
})
export class NavbarComponent {
  
tabs = ['ENIChatbot', 'Events', 'CityStats', 'Contact', 'Settings'];
  selectedTab = 0;

  @Output() tabSelected = new EventEmitter<number>();

  selectTab(index: number) {
    this.selectedTab = index;
    this.tabSelected.emit(this.selectedTab);
  }

  @Input() userName = 'Enicarthage';
  @Input() userLocation = 'Charguia 2, TN';
  @Input() avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjDGMp734S91sDuUFqL51_xRTXS15iiRoHew&s';
}
