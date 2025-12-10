import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-citystats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citystats.component.html',
  styleUrl: './citystats.component.css'
})
export class CitystatsComponent {

  // WEATHER & AIR QUALITY DATA
weatherStatus = "Cloudy";
temperature = 27;

aqi = 85;
pm10 = 45.0;
pm25 = 22.5;
no2 = 65.0;
co2 = 420.0;
o3 = 35.5;


  compareAnimation = false;
  showComparisonMsg = false;
  bestCity = "Tunis";

  cityA = "";
  cityB = "";

  showWeatherCard = false;

  checkCity() {
    this.showWeatherCard = true;
  }

  compareCities() {
    if (!this.cityA || !this.cityB) {
      this.bestCity = "Please enter both cities";
      this.showComparisonMsg = true;
      return;
    }

    this.compareAnimation = true;

    setTimeout(() => {
      this.bestCity = Math.random() > 0.5 ? this.cityA : this.cityB;
      this.showComparisonMsg = true;

      setTimeout(() => (this.compareAnimation = false), 1500);
    }, 800);
  }

  
  station: string = "";
  showAlert: boolean = false;

  busTime = "11:20 PM";
  trainTime = "10:45 PM";
  metroTime = "12:05 AM";

  verifySchedule() {
    if (!this.station.trim()) {
      alert("Please enter a valid station.");
      return;
    }

    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

}
