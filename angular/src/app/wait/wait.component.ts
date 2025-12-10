import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.css']
})
export class WaitComponent implements OnInit {
  loadingText: string = 'UrbainENI';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirection après 4 secondes vers blocdash
    setTimeout(() => {
      this.router.navigate(['/blocdash']); // Assure-toi que la route existe
    }, 6000);
  }
}
